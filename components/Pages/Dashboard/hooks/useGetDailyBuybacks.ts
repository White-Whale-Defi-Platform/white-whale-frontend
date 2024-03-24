import { useMemo } from 'react'
import { useQueries } from 'react-query'

import { Config, useConfig } from 'components/Pages/Bonding/hooks/useDashboardData'
import { getDailyBuybacks } from 'components/Pages/Dashboard/hooks/getDailyBuybacks'
import { ChainId, WalletChainName } from 'constants/index'
import { useClients } from 'hooks/useClients'
import { debounce } from 'lodash'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

export const useGetDailyBuybacks = () => {
  const { network } = useRecoilValue(chainState)
  const debouncedRefetch = useMemo(() => debounce((refetchFunc) => refetchFunc(), 500),
    [])
  const migalooConfig: Config = useConfig(network, ChainId.migaloo)
  const terraConfig: Config = useConfig(network, ChainId.terra)
  const junoConfig: Config = useConfig(network, ChainId.juno)
  const seiConfig: Config = useConfig(network, ChainId.sei)
  const injectiveConfig: Config = useConfig(network, ChainId.injective)
  const chihuahuaConfig: Config = useConfig(network, ChainId.chihuahua)
  const terracConfig: Config = useConfig(network, ChainId.terrac)
  const osmosisConfig: Config = useConfig(network, ChainId.osmosis)

  const { cosmWasmClient: migalooClient } = useClients(WalletChainName.migaloo)
  const { cosmWasmClient: terraClient } = useClients(WalletChainName.terra)
  const { cosmWasmClient: junoClient } = useClients(WalletChainName.juno)
  const { cosmWasmClient: seiClient } = useClients(WalletChainName.sei)
  const { cosmWasmClient: injectiveClient } = useClients(WalletChainName.injective)
  const { cosmWasmClient: chihuahuaClient } = useClients(WalletChainName.chihuahua)
  const { cosmWasmClient: terracClient } = useClients(WalletChainName.terrac)
  const { cosmWasmClient: osmosisClient } = useClients(WalletChainName.osmosis)

  const queries = useQueries([
    {
      queryKey: ['migalooBuyback', network, migalooConfig],
      queryFn: () => getDailyBuybacks(migalooConfig, migalooClient),
      enabled: Boolean(migalooClient) && Boolean(migalooConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['terraBuyback', network, terraConfig],
      queryFn: () => getDailyBuybacks(terraConfig, terraClient),
      enabled: Boolean(terraClient) && Boolean(terraConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['junoBuyback', network, junoConfig],
      queryFn: () => getDailyBuybacks(junoConfig, junoClient),
      enabled: Boolean(junoClient) && Boolean(junoConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['seiBuyback', network, seiConfig],
      queryFn: () => getDailyBuybacks(seiConfig, seiClient),
      enabled: Boolean(seiClient) && Boolean(seiConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['injectiveBuyback', network, injectiveConfig],
      queryFn: () => getDailyBuybacks(injectiveConfig, injectiveClient),
      enabled: Boolean(injectiveClient) && Boolean(injectiveConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['chihuahuaBuyback', network, chihuahuaConfig],
      queryFn: () => getDailyBuybacks(chihuahuaConfig, chihuahuaClient),
      enabled: Boolean(chihuahuaClient) && Boolean(chihuahuaConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['terracBuyback', network, terracConfig],
      queryFn: () => getDailyBuybacks(terracConfig, terracClient),
      enabled: Boolean(terracClient) && Boolean(terracConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['osmosisBuyback', network, osmosisConfig],
      queryFn: () => getDailyBuybacks(osmosisConfig, osmosisClient),
      enabled: Boolean(osmosisConfig) && Boolean(osmosisClient),
      refetchOnMount: false,
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
    const migalooBuyback = queries[0].data
    const terraBuyback = queries[1].data
    const junoBuyback = queries[2].data
    const seiBuyback = queries[3].data
    const injectiveBuyback = queries[4].data
    const chihuahuaBuyback = queries[5].data
    const terracBuyback = queries[6].data
    const osmosisBuyback = queries[7].data

    return [
      { chainName: WalletChainName.migaloo,
        buyback: migalooBuyback },
      { chainName: WalletChainName.terra,
        buyback: terraBuyback },
      { chainName: WalletChainName.juno,
        buyback: junoBuyback },
      { chainName: WalletChainName.sei,
        buyback: seiBuyback },
      { chainName: WalletChainName.injective,
        buyback: injectiveBuyback },
      { chainName: WalletChainName.chihuahua,
        buyback: chihuahuaBuyback },
      { chainName: WalletChainName.terrac,
        buyback: terracBuyback },
      { chainName: WalletChainName.osmosis,
        buyback: osmosisBuyback },
    ]
  }, [queries])

  return { data,
    isLoading,
    refetch: refetchAll }
}
