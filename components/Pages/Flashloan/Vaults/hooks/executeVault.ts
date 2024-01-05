import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { getInjectiveTxData } from 'util/injective'

type ExecuteAddLiquidityArgs = {
  senderAddress: string
  signingClient: SigningCosmWasmClient
  executionMsgs: any
  injectiveSigningClient?: InjectiveSigningStargateClient
}

export const executeVault = async ({
  executionMsgs,
  signingClient,
  injectiveSigningClient,
  senderAddress,
}: ExecuteAddLiquidityArgs): Promise<any> => {
  if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
    const injectiveTxData = await getInjectiveTxData(
      injectiveSigningClient, senderAddress, executionMsgs,
    )
    return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }

  return signingClient.signAndBroadcast(
    senderAddress, executionMsgs, 'auto',
  )
}
