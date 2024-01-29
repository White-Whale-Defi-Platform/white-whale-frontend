import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { ADV_MEMO, ChainId } from 'constants/index';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { createGasFee } from 'services/treasuryService';
import { createExecuteMessage } from 'util/messages'

type ExecuteFlashloanArgs = {
  senderAddress: string
  contractAddress: string
  signingClient: SigningCosmWasmClient
  msgs: any
  injectiveSigningClient?: InjectiveSigningStargateClient
}

export const executeFlashloan = async ({
  msgs,
  signingClient,
  contractAddress,
  senderAddress,
  injectiveSigningClient,
}: ExecuteFlashloanArgs): Promise<any> => {
  const execMsg = createExecuteMessage({
    senderAddress,
    contractAddress,
    message: msgs,
  })
  if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
    const injectiveTxData = await injectiveSigningClient.sign(
      contractAddress, [execMsg], await createGasFee(
        injectiveSigningClient, contractAddress, [execMsg],
      ), ADV_MEMO,
    )
    return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }
  return await signingClient.signAndBroadcast(
    contractAddress, [execMsg], await createGasFee(
      signingClient, contractAddress, [execMsg],
    ), ADV_MEMO,
  )
}
