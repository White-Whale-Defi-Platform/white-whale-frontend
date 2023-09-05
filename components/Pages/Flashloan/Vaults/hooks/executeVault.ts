import { coin } from '@cosmjs/stargate'
import { validateTransactionSuccess } from 'util/messages/index'
import { Wallet } from 'util/wallet-adapters/index'

type ExecuteAddLiquidityArgs = {
  isNative: boolean
  denom: string
  amount: string
  senderAddress: string
  contractAddress: string
  client: Wallet
  msgs: any
  encodedMsgs: any
}

export const executeVault = async ({
  isNative,
  denom,
  msgs,
  encodedMsgs,
  amount,
  client,
  contractAddress,
  senderAddress,
}: ExecuteAddLiquidityArgs): Promise<any> => {
  if (!isNative) {
    return validateTransactionSuccess(await client.post(senderAddress, encodedMsgs))
  }

  const funds = [coin(amount, denom)]

  return client.execute(
    senderAddress, contractAddress, msgs, funds,
  )
}
