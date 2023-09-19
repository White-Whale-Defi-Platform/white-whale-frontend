import { createExecuteMessage } from 'util/messages'
export const createFlashLoanMsg = ({
  senderAddress,
  contractAddress,
  message,
}) => createExecuteMessage({
  senderAddress,
  contractAddress,
  message,
})
