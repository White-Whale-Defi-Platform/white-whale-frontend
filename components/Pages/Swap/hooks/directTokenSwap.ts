import { coin } from '@cosmjs/stargate'
import { TokenInfo } from 'queries/usePoolsListQuery'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages'

import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'

import { TerraTreasuryService } from 'services/treasuryService'

type DirectTokenSwapArgs = {
  tokenAmount: string
  senderAddress: string
  swapAddress: string
  tokenA: TokenInfo
  signingClient: SigningCosmWasmClient
  msgs: Record<string, any>
  chainId?: string
}

export const directTokenSwap = async ({
  tokenA,
  swapAddress,
  senderAddress,
  tokenAmount,
  signingClient,
  msgs,
  chainId,
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
      message: msgs,
    })

    return validateTransactionSuccess(
      await signingClient.signAndBroadcast(
        senderAddress,
        [increaseAllowanceMessage, executeMessage],
        'auto',
        null
      )
    )
  }
  let fee = null
  if (chainId === 'columbus-5') {
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(tokenAmount, tokenA.denom)
  }

  return signingClient.execute(senderAddress, swapAddress, msgs, 'auto', null, [
    coin(tokenAmount, tokenA.denom), fee
  ])
}
