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
      config.bonding_tokens?.forEach((token: any) => {
        if (!tokenMapBySymbol.has(token.symbol)) {
          token.withoutPool = true
          tokenMapBySymbol.set(token.symbol, token)
        }
      })
      const chainRegistryAssets = assets.find((asset) => asset.chain_name === walletChainName)
      // TODO: ADD CHAIN REGISTRY TO API AND QUERY INFOS
      if (chainRegistryAssets) {
        for (const asset of chainRegistryAssets.assets) {
          try {
            const exponents = asset.denom_units.reduce((max, unit) => (unit.exponent > max.exponent ? unit : max), asset.denom_units[0])
            const native = (asset.type_asset === 'sdk.coin' || asset.type_asset === 'ics20' || asset.base.includes('factory/') || asset.base.charAt(0) == 'u') && asset.type_asset !== 'cw20'
            if (asset.name === 'Whale Token' && !native && walletChainName === 'terra'){
              continue
            }
            const denom = native ? asset.base : asset.address || asset.base
            const logoURI = asset.logo_URIs?.svg || asset.logo_URIs?.png || asset.images[0].svg || asset.images[0].png
            // HARDCODED FOR NOW
            if (asset.name == "DRUGS" && walletChainName === 'injective') {
              exponents.exponent = 18
            }
            let tmpAssetOBJ: any = { denom: denom, id: asset.coingecko_id || "", token_address: asset.address || asset.base, chain_id: chainId, symbol: asset.symbol, decimals: exponents.exponent, name: asset.name, logoURI: logoURI, tags: native ? ['native'] : [''], native: native, fromRegistry: true }
            const res = Array.from(tokenMapBySymbol.values())
            if (denom && !res.find((token) => token.denom === denom)) {
              tokenMapBySymbol.set(asset.symbol, tmpAssetOBJ)
            }
          } catch (e) {
            console.error('Error generating token list:', asset.name)
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
