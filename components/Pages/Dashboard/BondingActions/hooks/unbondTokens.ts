import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'
import { Wallet } from 'util/wallet-adapters/index'

import { TerraTreasuryService } from '../../../../../services/treasuryService'

export const unbondTokens = async (
  client: Wallet,
  address: string,
  amount: number,
  denom: string,
  config: Config,
) => {
  const handleMsg = {
    unbond: {
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
    funds: [] })
  let fee = null
  if (chainId === 'columbus-5') {
    const gas = Math.ceil(await client.simulate(
      address, [execMsg], '',
    ) * 1.3)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(amount, denom)
  }
  return await client.post(
    address, [execMsg], '', fee,
  )
}
