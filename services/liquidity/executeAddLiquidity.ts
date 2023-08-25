import { TokenInfo } from 'queries/usePoolsListQuery'
import { Wallet } from 'util/wallet-adapters'

type ExecuteAddLiquidityArgs = {
  tokenA: TokenInfo
  tokenB: TokenInfo
  tokenAAmount: string
  /*
   * The contract calculates `tokenBAmount` automatically.
   * However, the user needs to set max amount of `tokenB` they're willing to spend.
   * If the calculated amount exceeds the max amount, the transaction then fails.
   */
  maxTokenBAmount: string
  senderAddress: string
  swapAddress: string
  client: Wallet
  msgs: any
}

export const executeAddLiquidity = async ({
  client,
  senderAddress,
  msgs,
}: ExecuteAddLiquidityArgs): Promise<any> =>
// If (!tokenA.native || !tokenB.native) {

  client.post(senderAddress, msgs)
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
