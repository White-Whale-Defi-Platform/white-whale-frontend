import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { ADV_MEMO, ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { createGasFee } from 'services/treasuryService'

type ExecuteAddLiquidityArgs = {
  senderAddress: string
  signingClient: SigningCosmWasmClient
  executionMsgs: Array<any>
  injectiveSigningClient?: InjectiveSigningStargateClient
}

export const executeVault = async ({
  executionMsgs,
  signingClient,
  injectiveSigningClient,
  senderAddress,
}: ExecuteAddLiquidityArgs): Promise<any> => {
  if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
    const injectiveTxData = await injectiveSigningClient.sign(
      senderAddress, executionMsgs, await createGasFee(
        injectiveSigningClient, senderAddress, executionMsgs,
      ), ADV_MEMO,
    )
    return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }
  return await signingClient.signAndBroadcast(
    senderAddress, executionMsgs, await createGasFee(
      signingClient, senderAddress, executionMsgs,
    ), ADV_MEMO,
  )
}
