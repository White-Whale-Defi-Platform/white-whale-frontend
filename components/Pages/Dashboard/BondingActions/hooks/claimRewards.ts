import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'
import { Wallet } from 'util/wallet-adapters/index'

import { TerraTreasuryService } from '../../../../../services/treasuryService'

export const claimRewards = async (
  client: Wallet,
  address: string,
  config: Config,
) => {
  const handleMsg = {
    claim: {},
  }

  const execMsg = createExecuteMessage({ senderAddress: address,
    contractAddress: config.fee_distributor,
    message: handleMsg,
    funds: [] })
  let fee = null
  if (await client.getChainId() === 'columbus-5') {
    const gas = Math.ceil(await client.simulate(
      address, [execMsg], '',
    ) * 1.3)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(
      0, '', gas,
    )
  }
  return await client.post(
    address, [execMsg], '', fee,
  )
}
