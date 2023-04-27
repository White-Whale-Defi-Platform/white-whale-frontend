import { Wallet } from 'util/wallet-adapters'
import { coin } from '@cosmjs/stargate'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'

export const bondTokens = async (
  client: Wallet,
  address: string,
  amount: number,
  denom: string,
  config: Config
) => {
  const handleMsg = {
    bond: {
      asset: {
        amount: amount.toString(),
        info: {
          native_token: {
            denom: denom,
          },
        },
      },
    },
  }
  return client.execute(address, config.whale_lair_address, handleMsg, [
    coin(amount, denom),
  ])
}
