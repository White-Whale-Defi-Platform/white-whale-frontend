import {
  MsgExecuteContractEncodeObject,
} from '@cosmjs/cosmwasm-stargate'
import { coin } from '@cosmjs/stargate'

import { TokenInfo } from '../../queries/usePoolsListQuery'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from '../../util/messages'
import {Wallet} from "../../util/wallet-adapters";

type ExecuteAddLiquidityArgs = {
  tokenA: TokenInfo
  tokenB: TokenInfo
  tokenAAmount: number
  /*
   * The contract calculates `tokenBAmount` automatically.
   * However, the user needs to set max amount of `tokenB` they're willing to spend.
   * If the calculated amount exceeds the max amount, the transaction then fails.
   */
  maxTokenBAmount: number
  senderAddress: string
  swapAddress: string
  client: Wallet
  msgs: any
}

export const executeAddLiquidity = async ({
  tokenA,
  tokenB,
  tokenAAmount,
  maxTokenBAmount,
  client,
  swapAddress,
  senderAddress,
  msgs
}: ExecuteAddLiquidityArgs): Promise<any> => {

  if (!tokenA.native || !tokenB.native) {
    const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []

    /* increase allowance for each non-native token */
    if (!tokenA.native) {
      increaseAllowanceMessages.push(
        createIncreaseAllowanceMessage({
          tokenAmount: tokenAAmount,
          tokenAddress: tokenA.token_address,
          senderAddress,
          swapAddress,
        })
      )
    }
    if (!tokenB.native) {
      increaseAllowanceMessages.push(
        createIncreaseAllowanceMessage({
          tokenAmount: maxTokenBAmount,
          tokenAddress: tokenB.token_address,
          senderAddress,
          swapAddress,
        })
      )
    }

    const executeAddLiquidityMessage = createExecuteMessage({
      message: msgs,
      senderAddress,
      contractAddress: swapAddress,
      /* each native token needs to be added to the funds */
      funds: [
        tokenA.native && coin(tokenAAmount, tokenA.denom),
        tokenB.native && coin(maxTokenBAmount, tokenB.denom),
      ].filter(Boolean),
    })



    return validateTransactionSuccess(
      await client.post(senderAddress, [...increaseAllowanceMessages, executeAddLiquidityMessage])
    )
  }

  const funds = [
    coin(tokenAAmount, tokenA.denom),
    coin(maxTokenBAmount, tokenB.denom),
  ]
  // .sort((a, b) => (a.denom > b.denom ? 1 : -1))

  return await client.execute(
    senderAddress,
    swapAddress,
    msgs,
    funds
  )
}
