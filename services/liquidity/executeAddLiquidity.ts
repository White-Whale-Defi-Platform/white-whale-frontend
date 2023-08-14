import { TokenInfo } from 'queries/usePoolsListQuery'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'

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
  signingClient: SigningCosmWasmClient
  msgs: any
}

export const executeAddLiquidity = async ({
  signingClient,
  senderAddress,
  msgs,
}: ExecuteAddLiquidityArgs): Promise<any> =>
  await signingClient.signAndBroadcast(senderAddress, msgs, 'auto', null)
