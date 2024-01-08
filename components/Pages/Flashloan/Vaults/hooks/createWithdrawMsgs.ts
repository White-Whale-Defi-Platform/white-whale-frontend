import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { coin } from '@cosmjs/stargate'
import { isNativeToken } from 'services/asset'
import { toBase64 } from 'util/conversion/index'
import { createExecuteMessage, createIncreaseAllowanceMessage } from 'util/messages/index'

export const createWithdrawMsg = ({ amount, vaultAddress }) => ({
  send: {
    amount,
    contract: vaultAddress,
    msg: toBase64({
      withdraw: {},
    }),
  },
})

export const createWithdrawExecuteMsgs = ({
  lpToken,
  amount,
  vaultAddress,
  senderAddress,
}) => {
  const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []
  const isNative = isNativeToken(lpToken)

  if (!isNative) {
    increaseAllowanceMessages.push(createIncreaseAllowanceMessage({
      tokenAmount: amount,
      tokenAddress: lpToken,
      senderAddress,
      swapAddress: vaultAddress,
    }))
  }
  return [
    ...increaseAllowanceMessages,
    createExecuteMessage({
      senderAddress,
      contractAddress: isNative ? vaultAddress : lpToken,
      message: isNative ? {
        withdraw: {},
      } : createWithdrawMsg({
        amount,
        vaultAddress,
      }),
      funds: isNative ? [coin(amount, lpToken)] : [],
    }),
  ]
}
