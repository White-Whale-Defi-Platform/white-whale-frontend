import { Wallet } from 'util/wallet-adapters'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'

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
