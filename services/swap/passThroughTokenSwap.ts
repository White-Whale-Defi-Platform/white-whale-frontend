import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { coin } from '@cosmjs/stargate'
import { TokenInfo } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages'
import { createGasFee } from '../treasuryService'

type PassThroughTokenSwapArgs = {
  tokenAmount: string
  price: number
  slippage: number
  senderAddress: string
  swapAddress: string
  outputSwapAddress: string
  tokenA: TokenInfo
  signingClient: SigningCosmWasmClient
}

export const passThroughTokenSwap = async ({
  tokenAmount,
  tokenA,
  outputSwapAddress,
  swapAddress,
  senderAddress,
  slippage,
  price,
  signingClient,
}: PassThroughTokenSwapArgs): Promise<any> => {
  const minOutputToken = Math.floor(price * (1 - slippage))

  const swapMessage = {
    pass_through_swap: {
      output_min_token: `${minOutputToken}`,
      input_token: 'Token2',
      input_token_amount: `${tokenAmount}`,
      output_amm_address: outputSwapAddress,
    },
  }

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
      message: swapMessage,
    })

    return validateTransactionSuccess(await signingClient.signAndBroadcast(
      senderAddress,
      [increaseAllowanceMessage, executeMessage],
      await createGasFee(signingClient, senderAddress, [increaseAllowanceMessage, executeMessage]),
      null,
    ))
  }

  return signingClient.execute(
    senderAddress,
    swapAddress,
    swapMessage,
    'auto',
    null,
    [coin(tokenAmount, tokenA.denom)],
  )
}
