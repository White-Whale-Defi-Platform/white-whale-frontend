import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { ChainId } from 'constants/index'
import { TerraTreasuryService } from 'services/treasuryService'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'

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
  let fee: any = 'auto'
  if (await signingClient.getChainId() === ChainId.terrac) {
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
