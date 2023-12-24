import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { coin } from '@cosmjs/stargate'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { getInjectiveTxData } from 'util/injective'
import { createExecuteMessage, validateTransactionSuccess } from 'util/messages/index'

type ExecuteAddLiquidityArgs = {
  isNative: boolean
  denom: string
  amount: string
  senderAddress: string
  contractAddress: string
  signingClient: SigningCosmWasmClient
  injectiveSigningClient: InjectiveSigningStargateClient
  msgs: any
  encodedMsgs: any
}

export const executeVault = async ({
  isNative,
  denom,
  msgs,
  encodedMsgs,
  amount,
  signingClient,
  injectiveSigningClient,
  contractAddress,
  senderAddress,
}: ExecuteAddLiquidityArgs): Promise<any> => {
  if (!isNative) {
    return validateTransactionSuccess(await signingClient.signAndBroadcast(
      senderAddress,
      encodedMsgs,
      'auto',
      null,
    ))
  }

  const funds = [coin(amount, denom)]

  if (await signingClient.getChainId() === ChainId.injective) {
    const execMsg = createExecuteMessage({ senderAddress,
      contractAddress,
      message: msgs })
    const injectiveTxData = await getInjectiveTxData(
      injectiveSigningClient, senderAddress, [execMsg],
    )
    return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }

  return signingClient.execute(
    senderAddress,
    contractAddress,
    msgs,
    'auto',
    null,
    funds,
  )
}
