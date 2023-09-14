import { useMemo } from 'react'
import { useQueries } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import useEpoch from 'components/Pages/Trade/Incentivize/hooks/useEpoch'
import { fetchTotalLockedLp } from 'components/Pages/Trade/Pools/hooks/fetchTotalLockedLp'
import {
  AMP_WHALE_TOKEN_SYMBOL,
  B_WHALE_TOKEN_SYMBOL,
  DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
  POOL_REWARDS_ENABLED,
  WHALE_TOKEN_SYMBOL,
} from 'constants/index'
import { useClients } from 'hooks/useClients'
import usePrices from 'hooks/usePrices'
import { useTokenList } from 'hooks/useTokenList'
import { protectAgainstNaN } from 'junoblocks'
import { fromChainAmount } from 'libs/num'
import { queryPoolInfo } from 'queries/queryPoolInfo'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { TokenInfo } from 'types'

import { queryMyLiquidity } from './queryMyLiquidity'
import {
  SerializedRewardsContract,
  queryRewardsContracts,
} from './queryRewardsContracts'
import { useGetTokenDollarValueQuery } from './useGetTokenDollarValueQuery'
import { PoolEntityType, usePoolsListQuery } from './usePoolsListQuery'

export type AssetType = [number?, number?]

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
    total: AssetType
    provided: AssetType
    totalStaked: AssetType
    providedStaked: AssetType
    totalProvided: AssetType
  }

  rewards: {
    annualYieldPercentageReturn: number
    contracts?: Array<SerializedRewardsContract>
  }

  myFlows: Flow[]
}

export type PoolEntityTypeWithLiquidity = PoolEntityType & {
  liquidity?: PoolLiquidityState
  flows?: any
}

export type QueryMultiplePoolsArgs = {
  pools: Array<PoolEntityTypeWithLiquidity>
  refetchInBackground?: boolean
  cosmWasmClient: CosmWasmClient
}
export const calculateRewardsAnnualYieldRate = ({
  rewardsContracts,
  totalStakedDollarValue,
}) => {
  if (!POOL_REWARDS_ENABLED) {
    return 0
  }

  const totalRewardRatePerYearInDollarValue = rewardsContracts.reduce((value, { rewardRate }) => value + rewardRate.ratePerYear.dollarValue,
    0)

  return protectAgainstNaN((totalRewardRatePerYearInDollarValue / totalStakedDollarValue) * 100)
}

const fetchMyLockedLp = async ({ pool, cosmWasmClient, address }) => {
  if (!address || !cosmWasmClient || !pool.staking_address) {
    return null
  }

  const { positions = [] } =
    (await cosmWasmClient.queryContractSmart(pool.staking_address, {
      positions: { address },
    })) || []
  return (
    positions?.
      map((p) => {
        const { open_position = {}, closed_position = {} } = p
        return { ...open_position,
          ...closed_position }
      }).
      reduce((acc, p) => acc + Number(p.amount), 0) || 0
  )
}

export const useQueryPoolsLiquidity = ({
  pools,
  refetchInBackground = false,
  cosmWasmClient,
}: QueryMultiplePoolsArgs) => {
  const [getTokenDollarValue, enabledGetTokenDollarValue] =
    useGetTokenDollarValueQuery()
  const prices = usePrices()
  const { address } = useRecoilValue(chainState)

  const [tokenList] = useTokenList()
  const { epochToDate, currentEpoch } = useEpoch()

  const context = {
    cosmWasmClient,
    getTokenDollarValue,
  }

  const queryPoolLiquidity = async (pool: PoolEntityType): Promise<PoolEntityTypeWithLiquidity | any> => {
    if (!cosmWasmClient) {
      return pool
    }

    const poolInfo = await queryPoolInfo({
      context,
      swap_address: pool.swap_address,
    })

    const tokenA = pool.pool_assets.find((asset) => asset.denom ===
        (poolInfo?.assets[0]?.info?.native_token?.denom ??
          poolInfo?.assets[0]?.info?.token?.contract_addr))
    const tokenB = pool.pool_assets.find((asset) => asset.denom ===
        (poolInfo?.assets[1]?.info?.native_token?.denom ??
          poolInfo?.assets[1]?.info?.token?.contract_addr))

    const getFlows = async ({ cosmWasmClient }) => {
      if (
        !cosmWasmClient ||
        !pool?.staking_address ||
        !(tokenList.tokens.length > 0)
      ) {
        return []
      }
      const flows = await cosmWasmClient?.queryContractSmart(pool.staking_address,
        {
          flows: {},
        })
      return flows?.map((flow) => {
        const denom =
          flow?.flow_asset?.info?.token?.contract_addr ||
          flow?.flow_asset?.info.native_token?.denom ||
          null
        return tokenList?.tokens?.find((t) => t?.denom === denom)
      })
    }
    const getMyFlows = ({ cosmWasmClient, address }) => {
      if (
        !cosmWasmClient ||
        !pool?.staking_address ||
        !(tokenList.tokens.length > 0)
      ) {
        return []
      }
      return cosmWasmClient?.
        queryContractSmart(pool.staking_address, {
          flows: {},
        }).
        then((flows) => {
          const flowTokens = flows?.map((flow) => {
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

            /*
             * Check if end time is in the past
             * const state = dayjs(new Date()).isAfter(dayjs.unix(f.end_timestamp)) ? "over" : "active"
             */
            const state = getState()
            const denom =
              flow.flow_asset.info?.token?.contract_addr ||
              flow.flow_asset.info?.native_token?.denom ||
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
          if (!flowTokens) {
            return []
          }

          return flowTokens.filter(Boolean)
        })
    }

    const flows = await getFlows({ cosmWasmClient })
    const myLockedLp = await fetchMyLockedLp({ pool,
      cosmWasmClient,
      address })
    const totalLockedLp = await fetchTotalLockedLp(
      pool.staking_address,
      pool.lp_token,
      cosmWasmClient,
    )

    const {
      myNotLockedAssets,
      totalLockedAssets,
      myLockedAssets,
      totalAssets,
      myNotLockedLp,
    } = await queryMyLiquidity({
      context,
      swap: { ...poolInfo,
        ...pool },
      address,
      totalLockedLp,
      myLockedLp,
    })

    function getPoolTokensValues(assets, lpTokenAmount = null) {
      const tokenASymbol =
        tokenA?.symbol === AMP_WHALE_TOKEN_SYMBOL ||
        tokenA?.symbol === B_WHALE_TOKEN_SYMBOL
          ? WHALE_TOKEN_SYMBOL
          : tokenA?.symbol
      const tokenBSymbol =
        tokenB?.symbol === AMP_WHALE_TOKEN_SYMBOL ||
        tokenB?.symbol === B_WHALE_TOKEN_SYMBOL
          ? WHALE_TOKEN_SYMBOL
          : tokenB?.symbol
      return {
        tokenAmount: lpTokenAmount ?? assets[1] + assets[0],
        dollarValue:
          Number(fromChainAmount(assets[0])) * prices?.[tokenASymbol] +
          Number(fromChainAmount(assets[1])) * prices?.[tokenBSymbol],
      }
    }

    const [myNotLockedLiquidity, totalLockedLiquidity, myLockedLiquidity] = [
      /* Calc provided liquidity dollar value */
      getPoolTokensValues(myNotLockedAssets, myNotLockedLp),
      /* Calc total locked liquidity dollar value */
      getPoolTokensValues(totalLockedAssets),
      /* Calc provided liquidity dollar value */
      getPoolTokensValues(myLockedAssets),
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
        totalStakedDollarValue: totalLockedLiquidity.dollarValue || 1,
      })
    }

    const myFlows = await getMyFlows({ cosmWasmClient,
      address })
    const liquidity = {
      available: {
        totalLpAmount: poolInfo.lp_token_supply,
        provided: myNotLockedLiquidity,
      },
      locked: {
        total: totalLockedLiquidity,
        mine: myLockedLiquidity,
      },
      providedTotal: {
        tokenAmount:
          myNotLockedLiquidity.tokenAmount + myLockedLiquidity.tokenAmount,
        dollarValue:
          myNotLockedLiquidity.dollarValue + myLockedLiquidity.dollarValue,
      },
      myFlows,
      reserves: {
        myNotLocked: myNotLockedAssets,
        totalLocked: totalLockedAssets,
        myLocked: myLockedAssets,
        total: totalAssets as AssetType,
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

  return useQueries((pools ?? []).map((pool) => ({
    queryKey: `@pool-liquidity/${pool.pool_id}/${address}`,
    enabled:
        Boolean(cosmWasmClient && pool.pool_id && enabledGetTokenDollarValue) &&
        tokenList.tokens.length > 0 &&
        Boolean(prices),
    refetchOnMount: false as const,
    refetchInterval: refetchInBackground
      ? DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL
      : undefined,
    refetchIntervalInBackground: refetchInBackground,

    async queryFn() {
      if (!cosmWasmClient) {
        return pool
      }
      return await queryPoolLiquidity(pool)
    },
  })))
}

export const useQueryPoolLiquidity = ({ poolId }) => {
  const { data: poolsListResponse, isLoading: loadingPoolsList } =
    usePoolsListQuery()
  const { walletChainName } = useRecoilValue(chainState)
  const { cosmWasmClient } = useClients(walletChainName)

  const poolToFetch = useMemo(() => {
    const pool = poolsListResponse?.poolsById[poolId]
    return pool ? [pool] : undefined
  }, [poolId, poolsListResponse])

  const [poolResponse] = useQueryPoolsLiquidity({
    pools: poolToFetch,
    refetchInBackground: true,
    cosmWasmClient,
  })

  return [
    poolResponse?.data,
    poolResponse?.isLoading || loadingPoolsList,
    poolResponse?.isError,
  ] as const
}

