import { useQueries } from 'react-query'
import { useEffect, useMemo, useState } from 'react'
import { debounce } from 'lodash'
import { getBonded } from 'components/Pages/Dashboard/hooks/getBonded'
import { getTotalBonded } from 'components/Pages/Dashboard/hooks/getTotalBonded'
import { getUnbonding } from 'components/Pages/Dashboard/hooks/getUnbonding'
import { getWithdrawable } from 'components/Pages/Dashboard/hooks/getWithdrawable'
import { getFeeDistributorConfig } from 'components/Pages/Dashboard/hooks/getFeeDistributorConfig'
import { getCurrentEpoch } from 'components/Pages/Dashboard/hooks/getCurrentEpoch'
import { getClaimableEpochs } from 'components/Pages/Dashboard/hooks/getClaimableEpochs'
import { getClaimable } from 'components/Pages/Dashboard/hooks/getClaimable'
import { getBondingConfig } from 'components/Pages/Dashboard/hooks/getBondingConfig'
import { getWeight } from 'components/Pages/Dashboard/hooks/getWeight'
import { DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL } from 'util/constants'

export interface TokenDetails {
  name: string
  denom: string
  decimals: number
}

export interface Config {
  whale_lair_address: string
  fee_distributor_address: string
  whale_base_token: TokenDetails
  lsd_token: {
    ampWHALE: TokenDetails
    bWHALE: TokenDetails
  }
}

export const useConfig = (network: string, chainId: string) => {
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    if (network && chainId) {
      // Only execute if network and chainId are defined
      const fetchConfig = async () => {
        try {
          const response = await fetch(
            `/${network}/${chainId}/bonding_config.json`
          )
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

export const useDashboardData = (client, address, network, chainId) => {
  const debouncedRefetch = useMemo(
    () => debounce((refetchFunc) => refetchFunc(), 500),
    []
  )
  const config: Config = useConfig(network, chainId)

  const queries = useQueries([
    {
      queryKey: ['bonded', address, network, chainId],
      queryFn: () => getBonded(client, address, config),
      enabled: !!client && !!address && !!config,
      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
    },
    {
      queryKey: ['unbonding', address, network, chainId],
      queryFn: () => getUnbonding(client, address, config),
      enabled: !!client && !!address && !!config,
      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
    },
    {
      queryKey: ['withdrawable', address, network, chainId],
      queryFn: () => getWithdrawable(client, address, config),
      enabled: !!client && !!address && !!config,
      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
    },
    {
      queryKey: ['totalBonded', address, network, chainId],
      queryFn: () => getTotalBonded(client, config),
      enabled: !!client && !!config,
    },
    {
      queryKey: ['weightInfo', address, network, chainId],
      queryFn: () => getWeight(client, address, config),
      enabled: !!client && !!address && !!config,
    },
    {
      queryKey: ['feeDistributionConfig', address, network, chainId],
      queryFn: () => getFeeDistributorConfig(client, config),
      enabled: !!client && !!config,
    },
    {
      queryKey: ['currentEpoch', address, network, chainId],
      queryFn: () => getCurrentEpoch(client, config),
      enabled: !!client && !!config,
    },
    {
      queryKey: ['claimableEpochs', address, network, chainId],
      queryFn: () => getClaimableEpochs(client, config),
      enabled: !!client && !!config,
    },
    {
      queryKey: ['claimableRewards', address, network, chainId],
      queryFn: () => getClaimable(client, address, config),
      enabled: !!client && !!address && !!config,
    },
    {
      queryKey: ['bondingConfig', address, network, chainId],
      queryFn: () => getBondingConfig(client, config),
      enabled: !!client && !!config,
    },
  ])

  const isLoading = useMemo(
    () =>
      queries.some(
        (query) =>
          query.isLoading || query.data === null || query.data === undefined
      ),
    [queries]
  )

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
    }
  }, [queries])

  return { ...data, isLoading, refetch: refetchAll }
}
