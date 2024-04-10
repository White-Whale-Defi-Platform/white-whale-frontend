import { useQuery } from 'react-query'

import { TokenInfo, usePoolsListQuery } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import { useConfig } from '../components/Pages/Bonding/hooks/useDashboardData'

export type TokenList = {
  baseToken: TokenInfo
  tokens: Array<TokenInfo>
  tokensBySymbol: Map<string, TokenInfo>
}

export const useTokenList = () => {
  const { data: poolsListResponse } = usePoolsListQuery()
  const { chainId, network } = useRecoilValue(chainState)
  const config = useConfig(network, chainId)

  /* Generate token list off pool list and store it in cache */
  const { data } = useQuery<TokenList>(
    ['@token-list', chainId, network, config],
    () => {
      const tokenMapBySymbol = new Map()
      poolsListResponse.pools.forEach(({ pool_assets }) => {
        pool_assets.forEach((token) => {
          if (!tokenMapBySymbol.has(token.symbol)) {
            tokenMapBySymbol.set(token.symbol, token)
          }
        })
      })
      config.bonding_tokens?.forEach((token:any) => {
        if (!tokenMapBySymbol.has(token.symbol)) {
          token.withoutPool = true
          tokenMapBySymbol.set(token.symbol, token)
        }
      })
      return {
        baseToken: poolsListResponse.base_token,
        tokens: Array.from(tokenMapBySymbol.values()),
        tokensBySymbol: tokenMapBySymbol,
      }
    },
    {
      enabled: Boolean(poolsListResponse?.pools && config),
      refetchOnMount: false,
      onError(e) {
        console.error('Error generating token list:', e)
      },
    },
  )

  const isLoading = !poolsListResponse?.pools

  return [data, isLoading] as const
}
