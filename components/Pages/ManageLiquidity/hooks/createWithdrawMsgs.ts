import { isNativeAsset, toAsset, createAsset } from "../../../../services/asset";
import { createExecuteMessage } from 'util/messages';
import { coin } from "@cosmjs/proto-signing";
import {
  MsgExecuteContractEncodeObject,
  SigningCosmWasmClient,
} from '@cosmjs/cosmwasm-stargate'

import {
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages'

export const toBase64 = (obj: object) => {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}


export const createWithdrawMsg = ({ contract, amount, swapAddress }) => {
  return {
    send: {
      amount,
      contract : swapAddress,
      msg: toBase64({
        "withdraw_liquidity": {}
      }),
    },
  }
}

export const createWithdrawExecuteMsgs = ({ contract, amount, swapAddress }, senderAddress) => {

  const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []

    increaseAllowanceMessages.push(
      createIncreaseAllowanceMessage({
        tokenAmount: amount,
        tokenAddress: contract,
        senderAddress,
        swapAddress,
      })
    )

    return [
      // ...increaseAllowanceMessages,
      createExecuteMessage({
        senderAddress,
        contractAddress: contract,
        message: createWithdrawMsg({contract, amount, swapAddress})
      })

    ]
}
