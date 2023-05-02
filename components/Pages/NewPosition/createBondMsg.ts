import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { coin } from '@cosmjs/proto-signing'
import { MsgExecuteContract } from '@terra-money/feather.js'
import { createExecuteMessage } from 'util/messages'
import { createIncreaseAllowanceMessage } from 'util/messages'
import { toChainAmount } from '../../../libs/num'

export const toBase64 = (obj: object) => {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}

export const createBondtMsg = ({ amount }) => {
  return {
    open_position: {
      amount : amount,
      unbonding_duration: 86400
    },
  }
}

export const createBondExecuteMsgs = ({
  amount,
  stakingAddress,
  senderAddress
}) => {
  const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []

  increaseAllowanceMessages.push(
    createIncreaseAllowanceMessage({
      tokenAmount: amount,
      tokenAddress: stakingAddress,
      senderAddress,
      swapAddress: stakingAddress,
    })
  )

  return [
    ...increaseAllowanceMessages,
    createExecuteMessage({
      senderAddress,
      contractAddress: stakingAddress,
      message: createBondtMsg({ amount }),
      funds: [],
    }),
  ]
}
