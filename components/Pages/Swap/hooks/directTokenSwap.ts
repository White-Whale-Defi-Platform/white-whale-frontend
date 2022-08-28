import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { coin } from '@cosmjs/stargate'

import { TokenInfo } from 'queries/usePoolsListQuery'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages'

type DirectTokenSwapArgs = {
  tokenAmount: number
  senderAddress: string
  swapAddress: string
  tokenA: TokenInfo
  client: SigningCosmWasmClient
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
      await client.signAndBroadcast(
        senderAddress,
        [increaseAllowanceMessage, executeMessage],
        'auto'
      )
    )
  }

  return await client.execute(
    senderAddress,
    swapAddress,
    msgs,
    'auto',
    undefined,
    [coin(tokenAmount, tokenA.denom)]
  )
}
