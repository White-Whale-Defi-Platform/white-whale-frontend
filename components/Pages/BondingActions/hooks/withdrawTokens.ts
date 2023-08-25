import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { Wallet } from 'util/wallet-adapters'

export const withdrawTokens = (
  client: Wallet,
  address: string,
  denom: string,
  config: Config,
) => {
  const handleMsg = {
    withdraw: {
      denom,
    },
  }
  return client.execute(
    address, config.whale_lair, handleMsg,
  )
}
