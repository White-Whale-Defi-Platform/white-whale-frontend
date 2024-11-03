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
        filter((position) => (!lp_token || position.asset.info.native === lp_token || position.asset.info.cw20 === lp_token) &&
          position.shares !== '1').
        map((position) => ({
          open_position: {
            amount: position.asset.amount,
            unbonding_duration: -1,
            weight: position.shares,
            liquidity_alliance: true,
            lp: position.asset.info.native || position.asset.info.cw20,
            bribe_market: position.bribe_market,
          },
        }))
    },
    {
      retry: 5,
      refetchOnWindowFocus: false,
      cacheTime: 10 * 60 * 1000,
      staleTime: 5 * 60 * 1000,
      enabled: chainId === 'phoenix-1' && lp_token !== null && Boolean(cosmWasmClient),
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
    filter((position) => (!pool || position.asset.info.native === pool.lp_token ||  position.asset.info.cw20 === pool.lp_token) &&
      position.shares !== '1').
    map((position) => ({
      open_position: {
        amount: position.asset.amount,
        unbonding_duration: -1,
        weight: position.shares,
        liquidity_alliance: true,
        lp: position.asset.info.native || position.asset.info.cw20,
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
    const config = await cosmWasmClient?.queryContractSmart(bribeMarket, {
      config: {},
    })
    return assets.map((asset) => ({
      reward_asset: config.reward_info.native,
      reward_contract: config.reward_info.native.split('/')[1],
      token: asset?.cw20 || asset?.native,
      bribeMarket,
      config,
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
      refetchInterval: 1 * 60 * 1000,
      enabled: chainId === 'phoenix-1' && Boolean(cosmWasmClient),
      cacheTime: 12 * 60 * 60 * 1000,
      staleTime: 6 * 60 * 1000,
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
      asset.reward_asset.bribe_market = bribeMarket
      if (asset.reward_asset.info.native.endsWith('zluna')) {
        const claimAddress = asset.reward_asset.info.native.split('/')[1]
        //ampLuna
        asset.reward_asset.info.contract_addr = 'terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct'
        asset.reward_asset.info.claim_addr = claimAddress
      }
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
      refetchInterval: 10000,
      enabled: chainId === 'phoenix-1' && Boolean(address),
    },
  )
}
