import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages'

type ExecuteRemoveLiquidityArgs = {
  tokenAmount: number
  senderAddress: string
  swapAddress: string
  lpTokenAddress: string
  client: SigningCosmWasmClient,
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
    await client.signAndBroadcast(
      senderAddress,
      [increaseAllowanceMessage, executeMessage],
      'auto'
    )
  )
}
