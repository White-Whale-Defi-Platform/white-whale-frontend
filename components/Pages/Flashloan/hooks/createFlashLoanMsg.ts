import { createExecuteMessage } from 'util/messages'

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
