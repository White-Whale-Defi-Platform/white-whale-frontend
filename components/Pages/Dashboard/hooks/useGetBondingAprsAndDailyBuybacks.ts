import { useMemo } from 'react'
import { useQueries } from 'react-query'

import { Config, useConfig } from 'components/Pages/Bonding/hooks/useDashboardData'
import { getDailyBuybacks } from 'components/Pages/Dashboard/hooks/getDailyBuybacks'
import { getParamsAndCalculateApr } from 'components/Pages/Dashboard/hooks/getParamsAndCalculateApr'
import { ChainId, WalletChainName } from 'constants/index'
import { useClients } from 'hooks/useClients'
import { debounce } from 'lodash'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

export const useGetBondingAprsAndDailyBuybacks = () => {
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
      queryKey: ['migalooApr', network, migalooConfig],
      queryFn: () => getParamsAndCalculateApr(migalooConfig, migalooClient),
      enabled: Boolean(migalooClient) && Boolean(migalooConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['terraApr', network, terraConfig],
      queryFn: () => getParamsAndCalculateApr(terraConfig, terraClient),
      enabled: Boolean(terraClient) && Boolean(terraConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['junoApr', network, junoConfig],
      queryFn: () => getParamsAndCalculateApr(junoConfig, junoClient),
      enabled: Boolean(junoClient) && Boolean(junoConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['seiApr', network, seiConfig],
      queryFn: () => getParamsAndCalculateApr(seiConfig, seiClient),
      enabled: Boolean(seiClient) && Boolean(seiConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['injectiveApr', network, injectiveConfig],
      queryFn: () => getParamsAndCalculateApr(injectiveConfig, injectiveClient),
      enabled: Boolean(injectiveClient) && Boolean(injectiveConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['chihuahuaApr', network, chihuahuaConfig],
      queryFn: () => getParamsAndCalculateApr(chihuahuaConfig, chihuahuaClient),
      enabled: Boolean(chihuahuaClient) && Boolean(chihuahuaConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['terracApr', network, terracConfig],
      queryFn: () => getParamsAndCalculateApr(terracConfig, terracClient),
      enabled: Boolean(terracClient) && Boolean(terracConfig),
      refetchOnMount: false,
    },
    {
      queryKey: ['osmosisApr', network, osmosisConfig],
      queryFn: () => getParamsAndCalculateApr(osmosisConfig, osmosisClient),
      enabled: Boolean(osmosisConfig) && Boolean(osmosisClient),
      refetchOnMount: false,
    },
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
    const migalooApr = queries[0].data
    const terraApr = queries[1].data
    const junoApr = queries[2].data
    const seiApr = queries[3].data
    const injectiveApr = queries[4].data
    const chihuahuaApr = queries[5].data
    const terracApr = queries[6].data
    const osmosisApr = queries[7].data
    const migalooBuyback = queries[8].data
    const terraBuyback = queries[9].data
    const junoBuyback = queries[10].data
    const seiBuyback = queries[11].data
    const injectiveBuyback = queries[12].data
    const chihuahuaBuyback = queries[13].data
    const terracBuyback = queries[14].data
    const osmosisBuyback = queries[15].data

    return [
      { chainName: WalletChainName.migaloo,
        apr: migalooApr,
        buyback: migalooBuyback },
      { chainName: WalletChainName.terra,
        apr: terraApr,
        buyback: terraBuyback },
      { chainName: WalletChainName.juno,
        apr: junoApr,
        buyback: junoBuyback },
      { chainName: WalletChainName.sei,
        apr: seiApr,
        buyback: seiBuyback },
      { chainName: WalletChainName.injective,
        apr: injectiveApr,
        buyback: injectiveBuyback },
      { chainName: WalletChainName.chihuahua,
        apr: chihuahuaApr,
        buyback: chihuahuaBuyback },
      { chainName: WalletChainName.terrac,
        apr: terracApr,
        buyback: terracBuyback },
      { chainName: WalletChainName.osmosis,
        apr: osmosisApr,
        buyback: osmosisBuyback },
    ]
  }, [queries])

  return { data,
    isLoading,
    refetch: refetchAll }
}
