import { useMemo } from 'react'
import { useQueries } from 'react-query'

import { useCosmwasmClient } from 'hooks/useCosmwasmClient'
import { protectAgainstNaN, usePersistance } from 'junoblocks'
import { useRecoilValue } from 'recoil'

import { walletState } from '../state/atoms/walletAtoms'
import {
  __POOL_REWARDS_ENABLED__,
  DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
} from '../util/constants'
import { calcPoolTokenDollarValue } from '../util/conversion'
import { queryMyLiquidity } from './queryMyLiquidity'
import {
  queryRewardsContracts,
  SerializedRewardsContract,
} from './queryRewardsContracts'
import { queryStakedLiquidity } from './queryStakedLiquidity'
import { querySwapInfo } from './querySwapInfo'
import { useGetTokenDollarValueQuery } from './useGetTokenDollarValueQuery'
import { PoolEntityType, usePoolsListQuery } from './usePoolsListQuery'

export type ReserveType = [number, number]

export type PoolTokenValue = {
  tokenAmount: number
  dollarValue: number
}

export type PoolState = {
  total: PoolTokenValue
  provided: PoolTokenValue
}

export type PoolLiquidityState = {
  available: PoolState
  staked: PoolState

  providedTotal: PoolTokenValue

  reserves: {
    total: ReserveType
    provided: ReserveType
    totalStaked: ReserveType
    providedStaked: ReserveType
    totalProvided: ReserveType
  }

  rewards: {
    annualYieldPercentageReturn: number
    contracts?: Array<SerializedRewardsContract>
  }
}

export type PoolEntityTypeWithLiquidity = PoolEntityType & {
  liquidity?: PoolLiquidityState
}

type QueryMultiplePoolsArgs = {
  pools: Array<PoolEntityType>
  refetchInBackground?: boolean
  client: any
}

export const useQueryMultiplePoolsLiquidity = ({
  pools,
  refetchInBackground = false,
  client,
}: QueryMultiplePoolsArgs) => {
  const [getTokenDollarValue, enabledGetTokenDollarValue] =
    useGetTokenDollarValueQuery()
  const { address } = useRecoilValue(walletState)

  const context = {
    // client: signingClient,
    client,
    signingClient: client,
    getTokenDollarValue,
  }

  async function queryPoolLiquidity(
    pool: PoolEntityType
  ): Promise<PoolEntityTypeWithLiquidity> {
    if (!client) return pool

    const [tokenA] = pool.pool_assets

    const swap = await querySwapInfo({
      context,
      swap_address: pool.swap_address,
    })

    const { totalReserve, providedLiquidityInMicroDenom, providedReserve } =
      await queryMyLiquidity({
        context,
        swap: { ...swap, ...pool },
        address,
      })

    const {
      providedStakedAmountInMicroDenom,
      totalStakedAmountInMicroDenom,
      totalStakedReserve,
      providedStakedReserve,
    } = await queryStakedLiquidity({
      context,
      address,
      stakingAddress: pool.staking_address,
      totalReserve,
      swap,
    })

    const tokenADollarPrice = await getTokenDollarValue({
      tokenInfo: tokenA,
      tokenAmountInDenom: 1,
    })

    function getPoolTokensValue({ tokenAmountInMicroDenom }) {
      return {
        tokenAmount: tokenAmountInMicroDenom,
        dollarValue: calcPoolTokenDollarValue({
          tokenAmountInMicroDenom,
          tokenSupply: swap.lp_token_supply,
          tokenReserves: totalReserve[0],
          tokenDollarPrice: tokenADollarPrice,
          tokenDecimals: tokenA?.decimals,
        }),
      }
    }

    const [totalLiquidity, providedLiquidity, totalStaked, providedStaked] = [
      /* calc total liquidity dollar value */
      getPoolTokensValue({
        tokenAmountInMicroDenom: swap.lp_token_supply,
      }),
      /* calc provided liquidity dollar value */
      getPoolTokensValue({
        tokenAmountInMicroDenom: providedLiquidityInMicroDenom,
      }),
      /* calc total staked liquidity dollar value */
      getPoolTokensValue({
        tokenAmountInMicroDenom: totalStakedAmountInMicroDenom,
      }),
      /* calc provided liquidity dollar value */
      getPoolTokensValue({
        tokenAmountInMicroDenom: providedStakedAmountInMicroDenom,
      }),
    ]

    let annualYieldPercentageReturn = 0
    let rewardsContracts: Array<SerializedRewardsContract> | undefined

    const shouldQueryRewardsContracts = pool.rewards_tokens?.length > 0
    if (shouldQueryRewardsContracts) {
      rewardsContracts = await queryRewardsContracts({
        swapAddress: pool.swap_address,
        rewardsTokens: pool.rewards_tokens,
        context,
      })
      annualYieldPercentageReturn = calculateRewardsAnnualYieldRate({
        rewardsContracts,
        totalStakedDollarValue: totalStaked.dollarValue || 1,
      })
    }

    const liquidity = {
      available: {
        total: totalLiquidity,
        provided: providedLiquidity,
      },
      staked: {
        total: totalStaked,
        provided: providedStaked,
      },
      providedTotal: {
        tokenAmount: providedLiquidity.tokenAmount + providedStaked.tokenAmount,
        dollarValue: providedLiquidity.dollarValue + providedStaked.dollarValue,
      },
      reserves: {
        total: totalReserve,
        provided: providedReserve,
        totalStaked: totalStakedReserve,
        providedStaked: providedStakedReserve,
        totalProvided: [
          providedReserve[0] + providedStakedReserve[0],
          providedReserve[1] + providedStakedReserve[1],
        ] as ReserveType,
      },
      rewards: {
        annualYieldPercentageReturn,
        contracts: rewardsContracts,
      },
    }

    return {
      ...pool,
      liquidity,
    }
  }

  return useQueries(
    (pools ?? []).map((pool) => ({
      queryKey: `@pool-liquidity/${pool.pool_id}/${address}`,
      enabled: Boolean(!!client && pool.pool_id && enabledGetTokenDollarValue),
      refetchOnMount: false as const,
      refetchInterval: refetchInBackground
        ? DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL
        : undefined,
      refetchIntervalInBackground: refetchInBackground,

      async queryFn() {
        if (!client) return pool
        return queryPoolLiquidity(pool)
      },
    }))
  )
}

export const useQueryPoolLiquidity = ({ poolId }) => {
  const { data: poolsListResponse, isLoading: loadingPoolsList } =
    usePoolsListQuery()
  const { chainId } = useRecoilValue(walletState)
  const client = useCosmwasmClient(chainId)

  const poolToFetch = useMemo(() => {
    const pool = poolsListResponse?.poolsById[poolId]
    return pool ? [pool] : undefined
  }, [poolId, poolsListResponse])

  const [poolResponse] = useQueryMultiplePoolsLiquidity({
    pools: poolToFetch,
    refetchInBackground: true,
    client,
  })

  // const persistedData = usePersistance(poolResponse?.data)

  return [
    poolResponse?.data,
    poolResponse?.isLoading || loadingPoolsList,
    poolResponse?.isError,
  ] as const
}

export function calculateRewardsAnnualYieldRate({
  rewardsContracts,
  totalStakedDollarValue,
}) {
  if (!__POOL_REWARDS_ENABLED__) return 0

  const totalRewardRatePerYearInDollarValue = rewardsContracts.reduce(
    (value, { rewardRate }) => value + rewardRate.ratePerYear.dollarValue,
    0
  )

  return protectAgainstNaN(
    (totalRewardRatePerYearInDollarValue / totalStakedDollarValue) * 100
  )
}
