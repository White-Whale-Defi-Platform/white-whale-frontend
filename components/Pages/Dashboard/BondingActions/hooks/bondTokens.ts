import { coin } from '@cosmjs/stargate'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { TerraTreasuryService } from 'services/treasuryService'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'
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
  const execMsg = createExecuteMessage({ senderAddress: address,
    contractAddress: config.whale_lair,
    message: handleMsg,
    funds: [coin(amount, denom)] })
  let fee = null
  if (chainId === 'columbus-5') {
    const gas = Math.ceil(await client.simulate(
      address, [execMsg], '',
    ) * 1.3)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(
      amount, denom, gas,
    )
  }
  return await client.post(
    address, [execMsg], '', fee,
  )
}

