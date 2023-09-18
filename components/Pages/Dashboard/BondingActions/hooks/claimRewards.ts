import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'

import { TerraTreasuryService } from 'services/treasuryService'

export const claimRewards = async (
  signingClient: SigningCosmWasmClient,
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
  let fee = 'auto'
  if (await signingClient.getChainId() === 'columbus-5') {
    const gas = Math.ceil(await signingClient.simulate(
      address, [execMsg], '',
    ) * 1.3)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(
      0, '', gas,
    )
  }
  return await signingClient.signAndBroadcast(
    // @ts-ignore
    address, [execMsg], fee, '',
  )
}
