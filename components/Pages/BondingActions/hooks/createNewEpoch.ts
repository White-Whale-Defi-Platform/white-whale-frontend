import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { Wallet } from 'util/wallet-adapters'

export const createNewEpoch = async (
  client: Wallet,
  config: Config,
  address: string
) => {
  const handleMsg = {
    new_epoch: {},
  }
  return client.execute(address, config.fee_distributor, handleMsg)
}
