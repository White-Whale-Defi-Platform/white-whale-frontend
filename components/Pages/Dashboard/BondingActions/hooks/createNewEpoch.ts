import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'


import { TerraTreasuryService } from '../../../../../services/treasuryService'

export const createNewEpoch = async (
  signingClient: SigningCosmWasmClient,
  config: Config,
  address: string,
) => {
  const handleMsg = {
    new_epoch: {},
  }

  const execMsg = createExecuteMessage({ senderAddress: address,
    contractAddress: config.fee_distributor,
    message: handleMsg,
    funds: [] })
  let fee = null
  if (await signingClient.getChainId() === 'columbus-5') {
    const gas = Math.ceil(await signingClient.simulate(
      address, [execMsg], '',
    ) * 1.3)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(
      0, '', gas,
    )
  }
  return await signingClient.signAndBroadcast(
    address, [execMsg], fee, '', 
  )
}
