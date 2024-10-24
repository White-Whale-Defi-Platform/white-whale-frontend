import { useQuery } from 'react-query'

import { PoolLiquidityState } from 'components/Pages/Trade/Pools/hooks/useQueryPoolsLiquidity'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

export type TokenInfo = {
  fromRegistry?: boolean
  id: string
  chain_id: string
  token_address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
  tags: string[]
  denom: string
  native: boolean
}

export type TokenInfoWithReward = TokenInfo & {
  rewards_address: string
}

export type PoolEntityType = {
  pool_id: string
  lpOrder: string[] | undefined
  lp_token: string
  pool_assets: [TokenInfo, TokenInfo]
  swap_address: string
  staking_address: string
  rewards_tokens: Array<TokenInfoWithReward>
  liquidity?: PoolLiquidityState
}

export type PoolsListQueryResponse = {
  base_token: TokenInfo
  routerAddress: string
  pools: Array<PoolEntityType>
  poolsById: Record<string, PoolEntityType>
  name: string
  logoURI: string
  keywords: Array<string>
  tags: Record<string, { name: string; description: string }>
}

export const usePoolsListQuery = (options?: Parameters<typeof useQuery>[1]) => {
  const { chainId, network } = useRecoilValue(chainState)

  return useQuery<PoolsListQueryResponse>(
    ['@pools-list', chainId, network],
    async () => {
      const url = `/${network}/${chainId}${process.env.NEXT_PUBLIC_POOLS_LIST_URL}`
      const response = await fetch(url)
      const tokenList = await response.json()
      return {
        ...tokenList,
        poolsById: tokenList.pools.reduce((poolsById, pool) => ((poolsById[pool.pool_id] = pool), poolsById),
          {}),
        baseToken: tokenList.base_token,
      }
    },
    {
      retry: 5,
      enabled: Boolean(chainId),
      refetchOnMount: false,
      ...(options || {}),
    },
  )
}

export const usePoolFromListQueryById = ({ poolId }: { poolId: string }) => {
  const poolsListQuery = usePoolsListQuery();
  const { chainId } = useRecoilValue(chainState);

  return useQuery(
    ['poolById', poolId, chainId],
    () => {
      if (!poolsListQuery.data) {
        return undefined
      }
      return poolsListQuery.data.poolsById[poolId]
    },
    {
      enabled: Boolean(poolsListQuery.data) && Boolean(poolsListQuery.isLoading),
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  )
}
