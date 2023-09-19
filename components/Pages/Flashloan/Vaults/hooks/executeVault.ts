import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { coin } from '@cosmjs/stargate'
import { validateTransactionSuccess } from 'util/messages/index'

type ExecuteAddLiquidityArgs = {
  isNative: boolean
  denom: string
  amount: string
  senderAddress: string
  contractAddress: string
  signingClient: SigningCosmWasmClient
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

  return signingClient.execute(
    senderAddress,
    contractAddress,
    msgs,
    'auto',
    null,
    funds,
  )
}
