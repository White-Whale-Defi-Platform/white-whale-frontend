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

  if (!isNativeToken(lpToken)) {
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
      contractAddress: isNativeToken(lpToken) ? vaultAddress : lpToken,
      message: isNativeToken(lpToken) ? {
        withdraw: {
        } } : createWithdrawMsg({ amount,
        vaultAddress }),
      funds: isNativeToken(lpToken) ? [coin(amount, lpToken)] : [] }),
  ]
}
