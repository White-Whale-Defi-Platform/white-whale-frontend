import { TokenInfo } from 'queries/usePoolsListQuery'
import { TerraTreasuryService } from 'services/treasuryService'
import { Wallet } from 'util/wallet-adapters'

type ExecuteAddLiquidityArgs = {
  tokenA: TokenInfo
  tokenB: TokenInfo
  tokenAAmount: string
  tokenBAmount: string
  /*
   * The contract calculates `tokenBAmount` automatically.
   * However, the user needs to set max amount of `tokenB` they're willing to spend.
   * If the calculated amount exceeds the max amount, the transaction then fails.
   */
  senderAddress: string
  swapAddress: string
  client: Wallet
  msgs: any
  chainId?: string
}

export const executeAddLiquidity = async ({
  tokenA,
  tokenB,
  tokenAAmount,
  tokenBAmount,
  client,
  senderAddress,
  msgs,
  chainId,
}: ExecuteAddLiquidityArgs): Promise<any> => {
  let fee = null
  if (chainId === 'columbus-5') {
    const gas = Math.ceil(await client.simulate(
      senderAddress, msgs, '',
    ) * 1.3)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFeeForDeposit(
      tokenAAmount, tokenA.denom, tokenBAmount, tokenB.denom, gas,
    )
  }
  return client.post(
    senderAddress, msgs, null, fee,
  )
}
// Const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []

// /* increase allowance for each non-native token */
// If (!tokenA.native) {
//   IncreaseAllowanceMessages.push(
//     CreateIncreaseAllowanceMessage({
//       TokenAmount: tokenAAmount,
//       TokenAddress: tokenA.token_address,
//       SenderAddress,
//       SwapAddress,
//     })
//   )
// }
// If (!tokenB.native) {
//   IncreaseAllowanceMessages.push(
//     CreateIncreaseAllowanceMessage({
//       TokenAmount: maxTokenBAmount,
//       TokenAddress: tokenB.token_address,
//       SenderAddress,
//       SwapAddress,
//     })
//   )
// }

// Const executeAddLiquidityMessage = createExecuteMessage({
//   Message: msgs,
//   SenderAddress,
//   ContractAddress: swapAddress,
//   /* each native token needs to be added to the funds */
//   Funds: [
//     TokenA.native && coin(tokenAAmount, tokenA.denom),
//     TokenB.native && coin(maxTokenBAmount, tokenB.denom),
//   ].filter(Boolean),
// })

/*
 * Return validateTransactionSuccess(
 *   Await client.post(senderAddress, [
 *     ...increaseAllowanceMessages,
 *     ExecuteAddLiquidityMessage,
 *   ])
 * )
 * }
 */

/*
 * Const funds = [
 *   Coin(tokenAAmount, tokenA.denom),
 *   Coin(maxTokenBAmount, tokenB.denom),
 * ]
 * .sort((a, b) => (a.denom > b.denom ? 1 : -1))
 */

// Return await client.execute(senderAddress, swapAddress, msgs, funds)
