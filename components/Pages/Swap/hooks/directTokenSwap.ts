import { coin } from '@cosmjs/stargate'
import { TokenInfo } from 'queries/usePoolsListQuery'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages'

import { Wallet } from 'util/wallet-adapters'
import { TerraTreasuryService } from 'services/treasuryService'

type DirectTokenSwapArgs = {
  tokenAmount: string
  senderAddress: string
  swapAddress: string
  tokenA: TokenInfo
  client: Wallet
  msgs: Record<string, any>
  chainId?: string
}

export const directTokenSwap = async ({
  tokenA,
  swapAddress,
  senderAddress,
  tokenAmount,
  client,
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

    return validateTransactionSuccess(await client.post(senderAddress, [
      increaseAllowanceMessage,
      executeMessage,
    ]))
  }
  let fee = null
  if (chainId === 'columbus-5') {
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(tokenAmount, tokenA.denom)
  }
  return client.execute(
    senderAddress, swapAddress, msgs, [
      coin(tokenAmount, tokenA.denom),
    ],fee
  )
}
