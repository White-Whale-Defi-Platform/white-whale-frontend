import { useQuery } from 'react-query'

import {
  Config,
  useConfig,
} from 'components/Pages/Dashboard/hooks/useDashboardData'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { Wallet } from 'util/wallet-adapters/index'

export const useQueryIncentiveContracts = (client: Wallet): Array<string> => {
  const { chainId, network } = useRecoilValue(walletState)
  const config: Config = useConfig(network, chainId)
  const { data } = useQuery(
    ['useQueryIncentiveContracts', config],
    async () => fetchIncentiveContracts(client, config),
    {
      enabled:
        Boolean(client) && Boolean(config) && Boolean(config.incentive_factory),
    },
  )
  return data
}

const fetchIncentiveContracts = async (client,
  config: Config): Promise<Array<string>> => {
  const data = await client.queryContractSmart(config.incentive_factory, {
    incentives: {},
  })
  return data.map((incentive) => incentive.incentive_address)
}
