import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { coin } from '@cosmjs/proto-signing'
import { createExecuteMessage } from 'util/messages'
import { createIncreaseAllowanceMessage } from 'util/messages'
import { num } from 'libs/num'

import { createAsset, isNativeAsset } from 'services/asset'

const NUMBER_OF_SECONDS_IN_DAY = 86400

const createLpMsg = ({ tokenA, tokenB, amountA, amountB, bondingDays, pairAddress }) => {
  const asset1 = createAsset(amountA, tokenA?.token_address, tokenA?.native)
  const asset2 = createAsset(amountB, tokenB?.token_address, tokenB?.native)

  return {
    deposit: {
      assets: [asset1, asset2],
      pair_address: pairAddress,
      unbonding_duration: bondingDays * NUMBER_OF_SECONDS_IN_DAY
      // unbonding_duration: num(bondingDays).times(NUMBER_OF_SECONDS_IN_DAY).toNumber()
    },
  }
}

export const createLPExecuteMsgs = (
  { stakingProxy, tokenA, tokenB, amountA, amountB, bondingDays, pairAddress },
  sender: string
) => {
  const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []
  /* increase allowance for each non-native token */
  if (!tokenA?.native) {
    increaseAllowanceMessages.push(
      createIncreaseAllowanceMessage({
        tokenAmount: amountA,
        tokenAddress: tokenA?.token_address,
        senderAddress: sender,
        swapAddress : stakingProxy,
      })
    )
  }
  if (!tokenB?.native) {
    increaseAllowanceMessages.push(
      createIncreaseAllowanceMessage({
        tokenAmount: amountB,
        tokenAddress: tokenB?.token_address,
        senderAddress: sender,
        swapAddress : stakingProxy,
      })
    )
  }

  return [
    ...increaseAllowanceMessages,
    createExecuteMessage({
      senderAddress: sender,
      contractAddress: stakingProxy,
      message: createLpMsg({ tokenA, tokenB, amountA, amountB, bondingDays, pairAddress }),
      funds: [
        tokenA?.native && coin(amountA, tokenA?.denom),
        tokenB?.native && coin(amountB, tokenB?.denom),
      ].filter(Boolean),
    }),
  ]
}

export default createLpMsg
