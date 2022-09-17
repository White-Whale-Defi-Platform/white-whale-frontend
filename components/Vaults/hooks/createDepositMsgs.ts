import {
  MsgExecuteContractEncodeObject
} from '@cosmjs/cosmwasm-stargate';
import { createExecuteMessage } from 'util/messages';
import { coin } from "@cosmjs/proto-signing";

import {
  createIncreaseAllowanceMessage
} from 'util/messages';

export const toBase64 = (obj: object) => {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}


export const createDepostMsg = ({ amount }) => {
  return {
    "deposit": { amount }
  }
}


export const createDepostExecuteMsgs = ({ amount, vaultAddress, senderAddress, tokenInfo }) => {

  const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []

  if (!tokenInfo?.native) {
    increaseAllowanceMessages.push(
      createIncreaseAllowanceMessage({
        tokenAmount: amount,
        tokenAddress: tokenInfo?.denom,
        senderAddress,
        swapAddress: vaultAddress,
      })
    )
  }

  return [
    ...increaseAllowanceMessages,
    createExecuteMessage({
      senderAddress,
      contractAddress: vaultAddress,
      message: createDepostMsg({ amount }),
      funds: [
        tokenInfo?.native && coin(amount, tokenInfo.denom),
      ].filter(Boolean)
    })
  ]
}
