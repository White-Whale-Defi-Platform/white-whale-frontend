import { useQuery } from 'react-query'

import { TokenInfo, usePoolsListQuery } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import { useConfig } from '../components/Pages/Bonding/hooks/useDashboardData'
import { assets } from 'chain-registry'

export type TokenList = {
  baseToken: TokenInfo
  tokens: Array<TokenInfo>
  tokensBySymbol: Map<string, TokenInfo>
}

export const useTokenList = () => {
  const { data: poolsListResponse } = usePoolsListQuery()
  const { chainId, network, walletChainName } = useRecoilValue(chainState)
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
      const chainRegistryAssets = assets.find((asset) => asset.chain_name === walletChainName)
      if (chainRegistryAssets) {
        for (const asset of chainRegistryAssets.assets) {
          const exponents = asset.denom_units.reduce((max, unit) => (unit.exponent > max.exponent ? unit : max), asset.denom_units[0])
          const denom = asset.address ? asset.address : asset.base
          let tmpAssetOBJ: any = { denom: denom, id: asset?.coingecko_id || "", token_address: asset?.address || asset.base, chain_id: chainId, symbol: asset.symbol, decimals: exponents.exponent, name: asset.name, logoURI: asset.logo_URIs?.svg || asset.logo_URIs?.png, tags: asset?.address ? [''] : ['native'], native: asset?.address ? false : true, withoutPool: true}
          const res = Array.from(tokenMapBySymbol.values())
          if (!res.find((token) => token.denom === denom)) {
            tokenMapBySymbol.set(asset.symbol, tmpAssetOBJ)
          }
        }
      }
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
