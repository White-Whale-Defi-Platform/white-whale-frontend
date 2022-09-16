import {
  MsgExecuteContractEncodeObject,
  SigningCosmWasmClient,
} from '@cosmjs/cosmwasm-stargate'
import { coin } from '@cosmjs/stargate'

import { TokenInfo } from 'queries/usePoolsListQuery'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages'

type ExecuteAddLiquidityArgs = {
  isNative: boolean,
  denom: string,
  // tokenInfo: TokenInfo
  amount: string
  senderAddress: string
  contractAddress: string
  client: SigningCosmWasmClient
  msgs: any
  encodedMsgs: any
}

export const executeVault = async ({
  // tokenInfo,
  isNative,
  denom,
  msgs,
  encodedMsgs,
  amount,
  client,
  contractAddress,
  senderAddress
}: ExecuteAddLiquidityArgs): Promise<any> => {

  if (!isNative) {
    return validateTransactionSuccess(
      await client.signAndBroadcast(
        senderAddress,
        encodedMsgs,
        'auto'
      )
    )
  }

  const funds = [
    coin(amount, denom)
  ]

  return await client.execute(
    senderAddress,
    contractAddress,
    msgs,
    'auto',
    undefined,
    funds
  )
}
