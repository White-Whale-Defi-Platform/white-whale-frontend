import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { Config } from 'components/Pages/Bonding/hooks/useDashboardData'
import { ADV_MEMO, ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { createGasFee } from 'services/treasuryService'
import { createExecuteMessage } from 'util/messages/createExecuteMessage'

export const createNewEpoch: any = async (
  signingClient: SigningCosmWasmClient,
  config: Config,
  address: string,
  injectiveSigningClient?: InjectiveSigningStargateClient,
) => {
  const handleMsg = {
    new_epoch: {},
  }

  const execMsg = createExecuteMessage({ senderAddress: address,
    contractAddress: config.fee_distributor,
    message: handleMsg,
    funds: [] })
  if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
    const injectiveTxData = await injectiveSigningClient.sign(
      address, [execMsg], await createGasFee(
        injectiveSigningClient, address, [execMsg],
      ), ADV_MEMO,
    )
    return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }
  return await signingClient.signAndBroadcast(
    address, [execMsg], await createGasFee(
      signingClient, address, [execMsg],
    ), ADV_MEMO,
  )
}
