import { Wallet } from 'util/wallet-adapters'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'

export const unbondTokens = (client: Wallet, address: string, amount: number, denom: string, config: Config) => {
  const handleMsg = {
    unbond: {
      asset: {
        amount: amount.toString(),
        info: {
          native_token: {
            denom: denom
          }
        }
      }
    }
  }
  return client.execute(address, config.whale_lair_address, handleMsg)
}
