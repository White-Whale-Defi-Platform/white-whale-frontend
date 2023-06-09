import { Wallet } from 'util/wallet-adapters/index'
import { useQuery } from 'react-query'
import {
  IncentiveConfig,
  useIncentiveConfig,
} from 'components/Pages/Incentivize/hooks/useIncentiveConfig'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

export const useQueryIncentiveContracts = (client: Wallet): Array<string> => {
  const { chainId, network } = useRecoilValue(walletState)
  const config = useIncentiveConfig(network, chainId)
  const { data } = useQuery(
    ['useQueryIncentiveContracts', config],
    async () => await fetchIncentiveContracts(client, config),
    { enabled: !!client && !!config }
  )
  return data
}

const fetchIncentiveContracts = async (
  client,
  config: IncentiveConfig
): Promise<Array<string>> => {
  const data = await client.queryContractSmart(
    config.incentive_factory_address,
    { incentives: {} }
  )
  return data.map((incentive) => incentive.incentive_address)
}
