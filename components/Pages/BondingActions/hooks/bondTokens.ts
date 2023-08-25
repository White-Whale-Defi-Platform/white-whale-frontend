import { coin } from '@cosmjs/stargate'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { Wallet } from 'util/wallet-adapters'

export const bondTokens = async (
  client: Wallet,
  address: string,
  amount: number,
  denom: string,
  config: Config,
) => {
  const handleMsg = {
    bond: {
      asset: {
        amount: amount.toString(),
        info: {
          native_token: {
            denom,
          },
        },
      },
    },
  }
  return client.execute(
    address, config.whale_lair, handleMsg, [
      coin(amount, denom),
    ],
  )
}
