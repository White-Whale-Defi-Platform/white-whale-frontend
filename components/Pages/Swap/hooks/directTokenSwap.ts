import { coin } from '@cosmjs/stargate'
import { TokenInfo } from 'queries/usePoolsListQuery'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages'

import {Wallet} from "../../../../util/wallet-adapters";

type DirectTokenSwapArgs = {
  tokenAmount: number
  senderAddress: string
  swapAddress: string
  tokenA: TokenInfo
  client: Wallet
  msgs: Record<string, any>
}

export const directTokenSwap = async ({
  tokenA,
  swapAddress,
  senderAddress,
  tokenAmount,
  client,
  msgs
}: DirectTokenSwapArgs) => {

  if (!tokenA.native) {
    const increaseAllowanceMessage = createIncreaseAllowanceMessage({
      senderAddress,
      tokenAmount,
      tokenAddress: tokenA.token_address,
      swapAddress,
    })

    const executeMessage = createExecuteMessage({
      senderAddress,
      contractAddress: tokenA.token_address,
      message: msgs
    })


    return validateTransactionSuccess(
      await client.post(
        senderAddress,
        [increaseAllowanceMessage, executeMessage]
      )
    )
  }

  return await client.execute(
    senderAddress,
    swapAddress,
    msgs,
    [coin(tokenAmount, tokenA.denom)]
  )
}
