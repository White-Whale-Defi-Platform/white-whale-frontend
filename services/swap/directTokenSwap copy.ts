import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { coin } from '@cosmjs/stargate'

import { TokenInfo } from '../../queries/usePoolsListQuery'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from '../../util/messages'

type DirectTokenSwapArgs = {
  // swapDirection: 'tokenAtoTokenB' | 'tokenBtoTokenA'
  tokenAmount: number
  price: number
  slippage: number
  senderAddress: string
  swapAddress: string
  tokenA: TokenInfo
  client: SigningCosmWasmClient
  msgs: Record<string, any>
}

export const directTokenSwap = async ({
  tokenA,
  // swapDirection,
  swapAddress,
  senderAddress,
  slippage,
  price,
  tokenAmount,
  client,
  msgs
}: DirectTokenSwapArgs) => {
  const minToken = Math.floor(price * (1 - slippage))

  // const swapMessage = {
  //   swap: {
  //     "offer_asset": {
  //       "info": {
  //         "native_token": {
  //           "denom": "ujunox"
  //         }
  //       },
  //       "amount": tokenAmount.toString()
  //     },
  //     "to": senderAddress
  //   },
  // }
  // const swapMessage = {
  //   swap: {
  //     input_token: swapDirection === 'tokenAtoTokenB' ? 'Token1' : 'Token2',
  //     input_amount: `${tokenAmount}`,
  //     min_output: `${minToken}`,
  //   },
  // }

  if (!tokenA.native) {
    const increaseAllowanceMessage = createIncreaseAllowanceMessage({
      senderAddress,
      tokenAmount,
      tokenAddress: tokenA.token_address,
      swapAddress,
    })

    const executeMessage = createExecuteMessage({
      senderAddress,
      contractAddress: swapAddress,
      message: msgs,
      funds :[coin(tokenAmount, tokenA.denom)]
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
