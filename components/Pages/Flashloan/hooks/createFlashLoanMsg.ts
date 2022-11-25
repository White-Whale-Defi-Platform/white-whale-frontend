import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { createExecuteMessage } from 'util/messages'
import { createIncreaseAllowanceMessage } from 'util/messages'

export const toBase64 = (obj: object) => {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}

export const createFlashLoanMsg = ({
  senderAddress,
  contractAddress,
  message,
}) => {
  return createExecuteMessage({
    senderAddress,
    contractAddress,
    message,
  })
}
