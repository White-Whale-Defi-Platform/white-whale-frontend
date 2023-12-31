import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { ChainId } from 'constants/index';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { getInjectiveTxData } from 'util/injective'
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
  if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
    const execMsg = createExecuteMessage({ senderAddress,
      contractAddress,
      message: msgs })
    const injectiveTxData = await getInjectiveTxData(
      injectiveSigningClient, senderAddress, [execMsg],
    )
    return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }

  return await signingClient.execute(
    senderAddress, contractAddress, msgs, 'auto',
  )
}
