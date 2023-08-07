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
