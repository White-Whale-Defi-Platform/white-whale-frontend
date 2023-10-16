import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
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

  increaseAllowanceMessages.push(createIncreaseAllowanceMessage({
    tokenAmount: amount,
    tokenAddress: lpToken,
    senderAddress,
    swapAddress: vaultAddress,
  }))

  return [
    ...increaseAllowanceMessages,
    createExecuteMessage({
      senderAddress,
      contractAddress: lpToken,
      message: createWithdrawMsg({ amount,
        vaultAddress }),
    }),
  ]
}
