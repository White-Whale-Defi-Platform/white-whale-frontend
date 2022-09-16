import {
  MsgExecuteContractEncodeObject
} from '@cosmjs/cosmwasm-stargate';
import { createExecuteMessage } from 'util/messages';

import {
  createIncreaseAllowanceMessage
} from 'util/messages';

export const toBase64 = (obj: object) => {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}


export const createWithdrawMsg = ({ amount, vaultAddress }) => {
  return {
    send: {
      amount,
      contract: vaultAddress,
      msg: toBase64({
        "withdraw": {}
      }),
    },
  }
}

export const createWithdrawExecuteMsgs = ({ lpToken, amount, vaultAddress, senderAddress }) => {

  const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []

  increaseAllowanceMessages.push(
    createIncreaseAllowanceMessage({
      tokenAmount: amount,
      tokenAddress: lpToken,
      senderAddress,
      swapAddress: vaultAddress,
    })
  )

  return [
    ...increaseAllowanceMessages,
    createExecuteMessage({
      senderAddress,
      contractAddress: lpToken,
      message: createWithdrawMsg({ amount, vaultAddress })
    })

  ]
}
