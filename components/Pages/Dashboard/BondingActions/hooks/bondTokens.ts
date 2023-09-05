import { coin } from '@cosmjs/stargate'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { TerraTreasuryService } from 'services/treasuryService'
import { Wallet } from 'util/wallet-adapters/index'

export const bondTokens = async (
  client: Wallet,
  address: string,
  amount: number,
  denom: string,
  config: Config,
  chainId?: string,
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
  let fee = null
  if (chainId === 'columbus-5') {
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(amount, denom)
  }
  return client.execute(
    address, config.whale_lair, handleMsg, [
      coin(amount, denom),
    ], fee,
  )
}
