import { useMemo } from 'react'
import { useQueries } from 'react-query'

import { useCosmwasmClient } from 'hooks/useCosmwasmClient'
import { protectAgainstNaN } from 'junoblocks'
import { useRecoilValue } from 'recoil'

import { walletState } from 'state/atoms/walletAtoms'
import {
  __POOL_REWARDS_ENABLED__,
  DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
} from 'util/constants'
import { calcPoolTokenDollarValue } from 'util/conversion'
import { lpToAssets, queryMyLiquidity } from './queryMyLiquidity'
import {
  queryRewardsContracts,
  SerializedRewardsContract,
} from './queryRewardsContracts'
import { querySwapInfo } from './querySwapInfo'
import { useGetTokenDollarValueQuery } from './useGetTokenDollarValueQuery'
import { PoolEntityType, usePoolsListQuery } from './usePoolsListQuery'
import { useTokenList } from 'hooks/useTokenList'
import { TokenInfo } from 'types'
import useEpoch from 'components/Pages/Incentivize/hooks/useEpoch'

export type ReserveType = [number, number]

export type PoolTokenValue = {
  tokenAmount: number
  dollarValue: number
}

export type PoolState = {
  total: PoolTokenValue
  provided: PoolTokenValue
}

export type Flow = {
  token: TokenInfo
  endTime: number
  startTime: number
  flowId: number
  amount: string
  state: 'active' | 'over'
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

  myFlows: Flow[]
}

export type PoolEntityTypeWithLiquidity = PoolEntityType & {
  liquidity?: PoolLiquidityState
}

export type QueryMultiplePoolsArgs = {
  pools: Array<PoolEntityTypeWithLiquidity>
  refetchInBackground?: boolean
  client: any
}

const queryStakedLiquidity = async ({ pool, client, address }) => {
  if (!address || !client || !pool.staking_address) return

  const { positions = [] } =
    (await client?.queryContractSmart(pool.staking_address, {
      positions: { address },
    })) || []

  return (
    positions
      ?.map((p = {}) => {
        const { open_position = {}, closed_position = {} } = p
        return { ...open_position, ...closed_position }
      })
      .reduce((acc, p) => acc + Number(p.amount), 0) || 0
  )
}

export const useQueryMultiplePoolsLiquidity = ({
  pools,
  refetchInBackground = false,
  client,
}: QueryMultiplePoolsArgs) => {
  const [getTokenDollarValue, enabledGetTokenDollarValue] =
    useGetTokenDollarValueQuery()
  const { address } = useRecoilValue(walletState)

  const [tokenList] = useTokenList()
  const { epochToDate, currentEpoch } = useEpoch()

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

    const [tokenA, tokenB] = pool.pool_assets

    const swap = await querySwapInfo({
      context,
      swap_address: pool.swap_address,
    })

    const getFlows = ({ client }) => {
      if (!client || !pool?.staking_address || !(tokenList.tokens.length > 0))
        return []
      return client
        ?.queryContractSmart(pool.staking_address, {
          flows: {},
        })
        .then((flows) => {
          return flows?.map((flow = {}) => {
            const denom =
              flow?.flow_asset?.info?.token?.contract_addr ||
              flow?.flow_asset?.info.native_token?.denom ||
              null
            return tokenList?.tokens?.find((t) => t?.denom === denom)
          })
        })
    }
    const getMyFlows = ({ client, address }) => {
      if (!client || !pool?.staking_address || !(tokenList.tokens.length > 0))
        return []
      return client
        ?.queryContractSmart(pool.staking_address, {
          flows: {},
        })
        .then((flows) => {
          const flowTokens = flows?.map((flow = {}) => {

            const startEpoch = flow.start_epoch
            const endEpoch = flow.end_epoch

            const getState = () => {
              switch (true) {
                case currentEpoch < startEpoch:
                  return 'upcoming'
                case currentEpoch >= startEpoch && currentEpoch < endEpoch:
                  return 'active'
                case currentEpoch >= endEpoch:
                  return 'over'
                default:
                  return ''
              }
            }

            // check if end time is in the past
            // const state = dayjs(new Date()).isAfter(dayjs.unix(f.end_timestamp)) ? "over" : "active"
            const state = getState()
            const denom =
              flow?.flow_asset?.info?.token?.contract_addr ||
              flow?.flow_asset?.info?.native_token?.denom ||
              null
            const token = tokenList?.tokens?.find((t) => t?.denom === denom)

            return {
              token,
              isCreator: flow.flow_creator === address,
              endTime: epochToDate(endEpoch),
              startTime: epochToDate(startEpoch),
              flowId: flow.flow_id,
              amount: flow.flow_asset.amount,
              state,
            }
          })
          return flowTokens.filter(Boolean)
        })
    }

    const flows = await getFlows({ client })

    const stakedLP = await queryStakedLiquidity({ pool, client, address })
    const stakedReserved = lpToAssets({
      swap,
      providedLiquidityInMicroDenom: stakedLP,
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
    } = {
      providedStakedAmountInMicroDenom: stakedLP || 0,
      totalStakedAmountInMicroDenom: 0,
      totalStakedReserve: [],
      providedStakedReserve: stakedReserved?.providedReserve || [],
    }

    const tokenADollarPrice = await getTokenDollarValue({
      tokenA,
      tokenAmountInDenom: 1,
      tokenB,
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

    const myFlows = await getMyFlows({ client, address })
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
      myFlows,
      reserves: {
        total: totalReserve,
        provided: providedReserve,
        totalStaked: totalStakedReserve,
        providedStaked: providedStakedReserve,
        totalProvided: providedReserve as ReserveType,
      },
      rewards: {
        annualYieldPercentageReturn,
        contracts: rewardsContracts,
      },
    }

    return {
      ...pool,
      flows,
      liquidity,
    }
  }

  return useQueries(
    (pools ?? []).map((pool) => ({
      queryKey: `@pool-liquidity/${pool.pool_id}/${address}`,
      enabled:
        Boolean(!!client && pool.pool_id && enabledGetTokenDollarValue) &&
        tokenList.tokens.length > 0,
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
