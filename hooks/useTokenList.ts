import { useQuery } from 'react-query'

import { TokenInfo, usePoolsListQuery } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

export type TokenList = {
  baseToken: TokenInfo
  tokens: Array<TokenInfo>
  tokensBySymbol: Map<string, TokenInfo>
}

export const useTokenList = () => {
  const { data: poolsListResponse } = usePoolsListQuery()
  const { chainId, network } = useRecoilValue(chainState)

  /* Generate token list off pool list and store it in cache */
  const { data } = useQuery<TokenList>(
    ['@token-list', chainId, network],
    () => {
      const tokenMapBySymbol = new Map()
      poolsListResponse.pools.forEach(({ pool_assets }) => {
        pool_assets.forEach((token) => {
          if (!tokenMapBySymbol.has(token.symbol)) {
            tokenMapBySymbol.set(token.symbol, token)
          }
        })
      })

      return {
        baseToken: poolsListResponse.base_token,
        tokens: Array.from(tokenMapBySymbol.values()),
        tokensBySymbol: tokenMapBySymbol,
      }
    },
    {
      enabled: Boolean(poolsListResponse?.pools),
      refetchOnMount: false,
      onError(e) {
        console.error('Error generating token list:', e)
      },
    },
  )

  const isLoading = !poolsListResponse?.pools

  return [data, isLoading] as const
}
