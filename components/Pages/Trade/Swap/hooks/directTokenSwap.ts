import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { coin } from '@cosmjs/stargate'
import { TokenInfo } from 'queries/usePoolsListQuery'
import { TerraTreasuryService } from 'services/treasuryService'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages/index'

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

    return validateTransactionSuccess(await signingClient.signAndBroadcast(
      senderAddress,
      [increaseAllowanceMessage, executeMessage],
      'auto',
      null,
    ))
  }
  let fee = 'auto'
  if (await signingClient.getChainId() === 'columbus-5') {
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(tokenAmount, tokenA.denom)
  }
  return await signingClient.execute(
    senderAddress, swapAddress, msgs, fee, '', [
      coin(tokenAmount, tokenA.denom),
    ],
  )
}
