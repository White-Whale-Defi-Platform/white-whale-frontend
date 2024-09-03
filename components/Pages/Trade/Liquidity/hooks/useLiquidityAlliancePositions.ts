import { useQuery } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite'
import { useClients } from 'hooks/useClients'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import { TERRA2_BRIBE_MARKETS } from '../../../../../constants'

export const useLiquidityAlliancePositions = (lp_token?: any) => {
  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { cosmWasmClient } = useClients(walletChainName)

  return useQuery<any>(
    ['alliance-positions', address, lp_token],
    async () => {
      if (!address || chainId !== 'phoenix-1') {
        return null
      }

      const result = await Promise.all(Object.values(TERRA2_BRIBE_MARKETS).map(async (bribeMarket) => {
        const staked_balances = await cosmWasmClient?.queryContractSmart(bribeMarket, {
          all_staked_balances: { address },
        })
        return staked_balances?.map((position) => ({ ...position,
          bribe_market: bribeMarket })) || []
      }))

      return result.
        flat().
        filter((position) => (!lp_token || position.asset.info.native === lp_token) &&
          position.shares !== '1').
        map((position) => ({
          open_position: {
            amount: position.asset.amount,
            unbonding_duration: -1,
            weight: position.shares,
            liquidity_alliance: true,
            lp: position.asset.info.native,
            bribe_market: position.bribe_market,
          },
        }))
    },
    {
      retry: 5,
      refetchOnWindowFocus: false,
      cacheTime: 10 * 60 * 1000,
      staleTime: 5 * 60 * 1000,
      enabled: chainId === 'phoenix-1' && lp_token !== null,
    },
  )
}

export const queryAllStakedBalances = async (
  cosmWasmClient: any, address: string, pool?: any,
) => {
  const result = await Promise.all(Object.values(TERRA2_BRIBE_MARKETS).map(async (bribeMarket) => {
    const staked_balances = await cosmWasmClient?.queryContractSmart(bribeMarket, {
      all_staked_balances: { address },
    })
    return staked_balances?.map((position) => ({ ...position,
      bribe_market: bribeMarket })) || []
  }))
  return result.
    flat().
    filter((position) => (!pool || position.asset.info.native === pool.lp_token) &&
      position.shares !== '1').
    map((position) => ({
      open_position: {
        amount: position.asset.amount,
        unbonding_duration: -1,
        weight: position.shares,
        liquidity_alliance: true,
        lp: position.asset.info.native,
        bribe_market: position.bribe_market,
      },
    }))
}

const fetchWhitelistedAllianceTokens = async (
  cosmWasmClient: any, chainId: string, searchForToken?: string,
) => {
  if (!cosmWasmClient || chainId !== 'phoenix-1') {
    return []
  }

  const whitelistedAssets = await Promise.all(Object.values(TERRA2_BRIBE_MARKETS).map(async (bribeMarket) => {
    const assets = await cosmWasmClient?.queryContractSmart(bribeMarket, {
      whitelisted_assets: {},
    })
    return assets.map((asset) => ({
      token: asset?.cw20 || asset?.native,
      bribeMarket,
    }))
  }))

  return whitelistedAssets.
    flat().
    filter((asset) => !searchForToken || asset.token === searchForToken)
}

export const useFetchLiquidityAlliances = (searchForToken?: string) => {
  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { cosmWasmClient } = useClients(walletChainName)

  return useQuery(
    ['whitelistedAllianceToken', searchForToken],
    () => fetchWhitelistedAllianceTokens(
      cosmWasmClient, chainId, searchForToken,
    ),
    {
      refetchInterval: 9000,
      enabled: chainId === 'phoenix-1',
    },
  )
}

export const fetchAllAllianceRewards = async (
  cosmWasmClient: any, address: string, chainId: string,
) => {
  if (!cosmWasmClient || chainId !== 'phoenix-1') {
    return []
  }

  const rewards = await Promise.all(Object.values(TERRA2_BRIBE_MARKETS).map(async (bribeMarket) => {
    const assets = await cosmWasmClient?.queryContractSmart(bribeMarket, {
      all_pending_rewards: { address },
    })
    for (const asset of assets) {
      if (asset.reward_asset.info.native == 'factory/terra16l43xt2uq09yvz4axg73n8rtm0qte9lremdwm6ph0e35r2jnm43qnl8h53/zluna') {
        asset.reward_asset.info.denom = 'uluna'
      }
      asset.reward_asset.bribe_market = bribeMarket
    }
    return assets
  }))
  return rewards.flat()
}

export const useAllianceRewards = () => {
  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { cosmWasmClient } = useClients(walletChainName)

  return useQuery(
    ['allianceRewards', address],
    () => fetchAllAllianceRewards(
      cosmWasmClient, address, chainId,
    ),
    {
      refetchInterval: 9000,
      enabled: chainId === 'phoenix-1' && Boolean(address),
    },
  )
}
