import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages'

import {Wallet} from "../../util/wallet-adapters";

type ExecuteRemoveLiquidityArgs = {
  tokenAmount: number
  senderAddress: string
  swapAddress: string
  lpTokenAddress: string
  client: Wallet,
  msgs:any
}

export const executeRemoveLiquidity = async ({
  tokenAmount,
  swapAddress,
  senderAddress,
  lpTokenAddress,
  client,
  msgs
}: ExecuteRemoveLiquidityArgs) => {

  const increaseAllowanceMessage = createIncreaseAllowanceMessage({
    tokenAmount,
    senderAddress,
    tokenAddress: lpTokenAddress,
    swapAddress,
  })

  const executeMessage = createExecuteMessage({
    senderAddress,
    contractAddress: lpTokenAddress,
    message: msgs,
  })

  return validateTransactionSuccess(
    await client.post(senderAddress, [increaseAllowanceMessage, executeMessage])
  )
}
