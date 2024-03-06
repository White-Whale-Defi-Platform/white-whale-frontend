import { useEffect, useMemo, useState } from 'react'
import { useQueries } from 'react-query'

import { getBonded } from 'components/Pages/Bonding/hooks/getBonded'
import { getBondingConfig } from 'components/Pages/Bonding/hooks/getBondingConfig'
import { getClaimable } from 'components/Pages/Bonding/hooks/getClaimable'
import { getClaimableEpochs } from 'components/Pages/Bonding/hooks/getClaimableEpochs'
import { getCurrentEpoch } from 'components/Pages/Bonding/hooks/getCurrentEpoch'
import { getFeeDistributorConfig } from 'components/Pages/Bonding/hooks/getFeeDistributorConfig'
import { getTotalBonded } from 'components/Pages/Bonding/hooks/getTotalBonded'
import { getUnbonding } from 'components/Pages/Bonding/hooks/getUnbonding'
import { getWeight } from 'components/Pages/Bonding/hooks/getWeight'
import { getWithdrawable } from 'components/Pages/Bonding/hooks/getWithdrawable'
import { DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL } from 'constants/settings'
import { useClients } from 'hooks/useClients'
import { debounce } from 'lodash'
import { NetworkType } from 'state/chainState'

import { TokenInfo } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { getGlobalIndex } from './getGlobalIndex'

export interface TokenDetails {
  tokenSymbol: string
  denom: string
  decimals: number
}

export interface Config {
  whale_lair: string
  fee_distributor: string
  incentive_factory: string
  frontend_helper: string
  whale_base_token: TokenDetails
  bonding_tokens: TokenInfo[]
}

export const useConfig = (network: NetworkType, chainId: string) => {
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    if (network && chainId) {
      // Only execute if network and chainId are defined
      const fetchConfig = async () => {
        try {
          const response = await fetch(`/${network}/${chainId}/config.json`)
          const json: Config = await response.json()
          setConfig(json)
        } catch (error) {
          console.error('Failed to load config:', error)
        }
      }
      fetchConfig()
    }
  }, [network, chainId])

  return config
}

export const useDashboardData = (
  address: string, network: NetworkType, chainId: string, walletChainName: string,
) => {
  const debouncedRefetch = useMemo(() => debounce((refetchFunc) => refetchFunc(), 500),
    [])

  const config: Config = useConfig(network, chainId)

  const { cosmWasmClient: queryClient } = useClients(walletChainName)

  const queries = useQueries([
    {
      queryKey: ['bonded', address, network, chainId],

      queryFn: () => getBonded(
        queryClient, address, config,
      ),
      enabled: Boolean(queryClient) && Boolean(address) && Boolean(config),
      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
    },
    {
      queryKey: ['unbonding', address, network, chainId],
      queryFn: () => getUnbonding(
        queryClient, address, config,
      ),
      enabled: Boolean(queryClient) && Boolean(address) && Boolean(config),

      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
    },
    {
      queryKey: ['withdrawable', address, network, chainId],
      queryFn: () => getWithdrawable(
        queryClient, address, config,
      ),
      enabled: Boolean(queryClient) && Boolean(address) && Boolean(config),
      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
    },
    {
      queryKey: ['totalBonded', network, chainId],
      queryFn: () => getTotalBonded(queryClient, config),
      enabled: Boolean(queryClient) && Boolean(config),
    },
    {
      queryKey: ['weightInfo', address, network, chainId],
      queryFn: () => getWeight(
        queryClient, address, config,
      ),
      enabled: Boolean(queryClient) && Boolean(address) && Boolean(config),
    },
    {
      queryKey: ['feeDistributionConfig', network, chainId],
      queryFn: () => getFeeDistributorConfig(queryClient, config),
      enabled: Boolean(queryClient) && Boolean(config),
    },
    {
      queryKey: ['currentEpoch', network, chainId],
      queryFn: () => getCurrentEpoch(queryClient, config),
      enabled: Boolean(queryClient) && Boolean(config),
    },
    {
      queryKey: ['claimableEpochs', network, chainId],
      queryFn: () => getClaimableEpochs(queryClient, config),
      enabled: Boolean(queryClient) && Boolean(config),
    },
    {
      queryKey: ['claimableRewards', address, network, chainId],
      queryFn: () => getClaimable(
        queryClient, address, config,
      ),
      enabled: Boolean(queryClient) && Boolean(address) && Boolean(config),
    },
    {
      queryKey: ['bondingConfig', network, chainId],
      queryFn: () => getBondingConfig(queryClient, config),
      enabled: Boolean(queryClient) && Boolean(config),
    },
    {
      queryKey: ['globalIndex', network, chainId],
      queryFn: () => getGlobalIndex(queryClient, config),
      enabled: Boolean(queryClient) && Boolean(config),
    },
  ])

  const isLoading = useMemo(() => queries.some((query) => (
    query.isLoading || (!query.data && query.data !== 0)
  )),
  [queries])

  const refetchAll = () => {
    queries.forEach((query) => {
      debouncedRefetch(query.refetch)
    })
  }

  const data = useMemo(() => {
    const bondedData = queries[0].data
    const unbondingData = queries[1].data
    const withdrawableData = queries[2].data
    const totalBondedData = queries[3].data
    const weightData = queries[4].data
    const feeDistributionData = queries[5].data
    const currentEpochData = queries[6].data
    const claimableEpochsData = queries[7].data
    const claimableRewardsData = queries[8].data
    const bondingConfigData = queries[9].data
    const globalIndexData = queries[10].data
    return {
      ...bondedData,
      ...unbondingData,
      ...withdrawableData,
      ...totalBondedData,
      ...weightData,
      ...feeDistributionData,
      ...currentEpochData,
      ...claimableEpochsData,
      ...claimableRewardsData,
      ...bondingConfigData,
      globalIndexInfo: globalIndexData,
    }
  }, [queries])

  return { ...data,
    isLoading,
    refetch: refetchAll }
}
