import { useQuery } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import {
  Config,
  useConfig,
} from 'components/Pages/Bonding/hooks/useDashboardData'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

const fetchIncentiveContracts = async (client: CosmWasmClient,
  config: Config): Promise<Array<string>> => {
  const data = await client.queryContractSmart(config.incentive_factory, {
    incentives: { limit: 100 },
  })
  return data?.map((incentive: { incentive_address: string }) => incentive.incentive_address)
}

export const useQueryIncentiveContracts = (cosmWasmClient: CosmWasmClient): Array<string> => {
  const { chainId, network } = useRecoilValue(chainState)
  const config: Config = useConfig(network, chainId)
  const { data } = useQuery(
    ['useQueryIncentiveContracts', config],
    async () => await fetchIncentiveContracts(cosmWasmClient, config),
    {
      enabled:
        Boolean(cosmWasmClient) &&
        Boolean(config) &&
        Boolean(config?.incentive_factory),
    },
  )
  return data
}

