import { coin } from '@cosmjs/stargate'
import { TokenInfo } from 'queries/usePoolsListQuery'
import { TerraTreasuryService } from 'services/treasuryService'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages/index'
import { Wallet } from 'util/wallet-adapters/index'

type DirectTokenSwapArgs = {
  tokenAmount: string
  senderAddress: string
  swapAddress: string
  tokenA: TokenInfo
  client: Wallet
  msgs: Record<string, any>
  chainId?: string
  gas:number
}

export const directTokenSwap = async ({
  tokenA,
  swapAddress,
  senderAddress,
  tokenAmount,
  client,
  msgs,
  chainId,
  gas,
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
  const execMsg = createExecuteMessage({ senderAddress,
    contractAddress: swapAddress,
    message: msgs,
    funds: [coin(tokenAmount, tokenA.denom)] })
  if (chainId === 'columbus-5') {
    const gas = Math.ceil(await client.simulate(
      senderAddress, [execMsg], '',
    ) * 1.3)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(
      tokenAmount, tokenA.denom, gas,
    )
  }
  return await client.post(
    senderAddress, [execMsg], '', fee,
  )
}
