import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { Config } from 'components/Pages/Bonding/hooks/useDashboardData'
import { ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { TerraTreasuryService } from 'services/treasuryService'
import { getInjectiveTxData } from 'util/injective'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'

export const createNewEpoch: any = async (
  signingClient: SigningCosmWasmClient,
  config: Config,
  address: string,
  injectiveSigningClient?: InjectiveSigningStargateClient
) => {
  const handleMsg = {
    new_epoch: {},
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
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(null, gas)
  } else if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
    const injectiveTxData = await getInjectiveTxData(
      injectiveSigningClient, address, [execMsg],
    )
    return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }
  return await signingClient.signAndBroadcast(
    address, [execMsg], fee, '',
  )
}
