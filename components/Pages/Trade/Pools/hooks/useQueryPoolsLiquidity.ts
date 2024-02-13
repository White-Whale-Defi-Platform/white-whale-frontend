import { useMemo } from 'react'
import { useQueries } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useChain } from '@cosmos-kit/react-lite'
import useEpoch from 'components/Pages/Trade/Incentivize/hooks/useEpoch'
import { fetchFlows } from 'components/Pages/Trade/Incentivize/hooks/useIncentivePoolInfo'
import { queryPoolInfo } from 'components/Pages/Trade/Pools/hooks/queryPoolInfo'
import { PoolEntityType, usePoolsListQuery } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import {
  DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
} from 'constants/index'
import { IncentiveState } from 'constants/state'
import { useClients } from 'hooks/useClients'
import { usePrices } from 'hooks/usePrices'
import { useTokenList } from 'hooks/useTokenList'
import { fromChainAmount } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { isNativeToken } from 'services/asset'
import { queryLiquidityBalance } from 'services/liquidity'
import { chainState } from 'state/chainState'
import { convertMicroDenomToDenom, protectAgainstNaN } from 'util/conversion'

export type AssetType = [number?, number?]

export type PoolTokenValue = {
  tokenAmount: number
  dollarValue: number
}

export type PoolState = {
  total: PoolTokenValue
  provided: PoolTokenValue
}

type TokenInfo = {
  token_info: any
}

export type Flow = {
  token: TokenInfo
  endTime: number
  startTime: number
  flowId: number
  amount: string
  state: IncentiveState.active | IncentiveState.over
}

export type PoolLiquidityState = {
  available: PoolState
  staked: PoolState

  providedTotal: PoolTokenValue

  reserves: {
    myNotLocked: AssetType
    totalLocked: AssetType
    myLocked: AssetType
    total: AssetType
    totalAssetsInDollar: number
    ratioFromPool: number
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

const queryMyLiquidity = async ({
  swap,
  address,
  cosmWasmClient,
  totalLockedLp,
  myLockedLp,
  prices,
}) => {
  const tokenASymbol = swap?.assetOrder[0]
  const tokenADecimals = swap.pool_assets?.[0]?.decimals
  const tokenBSymbol = swap?.assetOrder[1]
  const tokenBDecimals = swap.pool_assets?.[1]?.decimals
  const isNative = isNativeToken(swap.lp_token)
  const myNotLockedLp = address
    ? await queryLiquidityBalance({
      tokenAddress: swap.lp_token,
      cosmWasmClient,
      address,
      isNative,
    })
    : 0

  const totalAssets: [number, number] = [
    protectAgainstNaN(swap.token1_reserve),
    protectAgainstNaN(swap.token2_reserve),
  ]
  const totalAssetsInDollar: [number, number] = [
    convertMicroDenomToDenom(protectAgainstNaN(swap.token1_reserve), tokenADecimals) * (prices?.[tokenASymbol] || 0),
    convertMicroDenomToDenom(protectAgainstNaN(swap.token2_reserve), tokenBDecimals) * (prices?.[tokenBSymbol] || 0),
  ]

  const myNotLockedAssets: [number, number] = [
    protectAgainstNaN(totalAssets[0] * (myNotLockedLp / swap.lp_token_supply)),
    protectAgainstNaN(totalAssets[1] * (myNotLockedLp / swap.lp_token_supply)),
  ]
  const totalLockedAssets: [number, number] = [
    protectAgainstNaN(totalAssets[0] * (totalLockedLp / swap.lp_token_supply)),
    protectAgainstNaN(totalAssets[1] * (totalLockedLp / swap.lp_token_supply)),
  ]

  const myLockedAssets: [number, number] = [
    protectAgainstNaN(totalAssets[0] * (myLockedLp / swap.lp_token_supply)),
    protectAgainstNaN(totalAssets[1] * (myLockedLp / swap.lp_token_supply)),
  ]

  return {
    totalAssets,
    totalAssetsInDollar: (totalAssetsInDollar[0] + totalAssetsInDollar[1]),
    ratioFromPool: convertMicroDenomToDenom(swap.token2_reserve, tokenBDecimals) / convertMicroDenomToDenom(swap.token1_reserve, tokenADecimals),
    myNotLockedAssets,
    myLockedAssets,
    totalLockedAssets,
    myNotLockedLp,
  }
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
        return {
          ...open_position,
          ...closed_position,
        }
      }).
      reduce((acc, p) => acc + Number(p.amount), 0) || 0
  )
}

export const fetchTotalLockedLp = async (
  incentiveAddress: string,
  lpAddress: string,
  client: CosmWasmClient,
) => {
  if (!client || !incentiveAddress || !lpAddress) {
    return null
  }

  const { balance, amount } = isNativeToken(lpAddress)
    ? await client.getBalance(incentiveAddress, lpAddress)
    : await client.queryContractSmart(lpAddress, {
      balance: { address: incentiveAddress },
    })

  return Number(balance || amount)
}

export const useQueryPoolsLiquidity = ({
  pools,
  refetchInBackground = false,
  cosmWasmClient,
}: QueryMultiplePoolsArgs) => {
  const prices = usePrices()
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)

  const [tokenList] = useTokenList()
  const { epochToDate, currentEpoch } = useEpoch()

  const queryPoolLiquidity = async (pool: PoolEntityType): Promise<PoolEntityTypeWithLiquidity | any> => {
    if (!cosmWasmClient) {
      return pool
    }

    const poolInfo = await queryPoolInfo({
      cosmWasmClient,
      swap_address: pool.swap_address,
    })

    const getTokenDenom = (assetInfo) => assetInfo?.info?.native_token?.denom ?? assetInfo?.info?.token?.contract_addr

    const tokenA = pool.pool_assets.find((asset) => asset.denom === getTokenDenom(poolInfo?.assets[0]));
    const tokenB = pool.pool_assets.find((asset) => asset.denom === getTokenDenom(poolInfo?.assets[1]));

    const getFlows = async ({ cosmWasmClient }) => {
      if (
        !cosmWasmClient ||
        !pool?.staking_address ||
        !(tokenList.tokens.length > 0)
      ) {
        return []
      }
      const flows = await fetchFlows(cosmWasmClient, pool.staking_address)
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
      return fetchFlows(cosmWasmClient, pool?.staking_address).
        then((flows) => {
          const flowTokens = flows?.map((flow) => {
            const startEpoch = flow.start_epoch
            const endEpoch = flow.end_epoch
            const getState = () => {
              switch (true) {
                case currentEpoch >= startEpoch && currentEpoch < endEpoch:
                  return IncentiveState.active
                case currentEpoch < startEpoch:
                  return IncentiveState.upcoming
                case currentEpoch >= endEpoch:
                  return IncentiveState.over
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
    const myLockedLp = await fetchMyLockedLp({
      pool,
      cosmWasmClient,
      address,
    })
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
      totalAssetsInDollar,
      ratioFromPool,
      myNotLockedLp,
    } = await queryMyLiquidity({
      cosmWasmClient,
      swap: {
        ...poolInfo,
        ...pool,
      },
      address,
      totalLockedLp,
      myLockedLp,
      prices,
    })

    const getPoolTokensValues = (assets: any, lpTokenAmount = null) => ({
      tokenAmount: lpTokenAmount ?? (assets[1] + assets[0]),
      dollarValue:
        (Number(fromChainAmount(assets[0], tokenA?.decimals)) * (prices?.[tokenA?.symbol] || 0)) +
        (Number(fromChainAmount(assets[1], tokenB?.decimals)) * (prices?.[tokenB?.symbol] || 0)),
    })

    const [myNotLockedLiquidity, totalLockedLiquidity, myLockedLiquidity] = [
      /* Calc provided liquidity dollar value */
      getPoolTokensValues(myNotLockedAssets, myNotLockedLp),
      /* Calc total locked liquidity dollar value */
      getPoolTokensValues(totalLockedAssets),
      /* Calc provided liquidity dollar value */
      getPoolTokensValues(myLockedAssets),
    ]

    const myFlows = await getMyFlows({
      cosmWasmClient,
      address,
    })
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
        totalAssetsInDollar,
        ratioFromPool,
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
      Boolean(cosmWasmClient && pool.pool_id) &&
      tokenList.tokens.length > 0 &&
      Boolean(prices),
    refetchOnMount: false,
    refetchInterval: refetchInBackground
      ? DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL
      : null,
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
    return pool ? [pool] : null
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

