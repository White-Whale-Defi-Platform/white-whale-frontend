import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'

import { createExecuteMessage } from 'util/messages/createExecuteMessage'

import { TerraTreasuryService } from '../../../../../services/treasuryService'

export const withdrawTokens = async (
  signingClient: SigningCosmWasmClient,
  address: string,
  denom: string,
  config: Config,
) => {
  const handleMsg = {
    withdraw: {
      denom,
    },
  }

  const execMsg = createExecuteMessage({ senderAddress: address,
    contractAddress: config.whale_lair,
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
    address, [execMsg], fee, ''
  )
}
