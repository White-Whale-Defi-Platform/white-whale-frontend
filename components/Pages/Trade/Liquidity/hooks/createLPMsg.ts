import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { coin } from '@cosmjs/proto-signing'
import { createAsset } from 'services/asset'
import { createExecuteMessage, createIncreaseAllowanceMessage } from 'util/messages/index'

const createLpMsg = ({
  tokenA,
  tokenB,
  amountA,
  amountB,
  bondingDays,
  pairAddress,
  minUnbondingDuration,
}) => {
  const asset1 = createAsset(
    amountA, tokenA?.token_address, tokenA?.native,
  )
  const asset2 = createAsset(
    amountB, tokenB?.token_address, tokenB?.native,
  )

  if (bondingDays === 0) {
    return {
      provide_liquidity: {
        assets: [asset1, asset2],
        slippage_tolerance: '0.15',
      },
    }
  }

  return {
    deposit: {
      assets: [asset1, asset2],
      pair_address: pairAddress,
      unbonding_duration: bondingDays * minUnbondingDuration,
      slippage_tolerance: '0.15',
    },
  }
}

export const createLPExecuteMsgs = ({
  stakingProxy,
  tokenA,
  tokenB,
  amountA,
  amountB,
  bondingDays,
  pairAddress,
  minUnbondingDuration,
},
sender: string) => {
  const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []
  /* Increase allowance for each non-native token */
  if (!tokenA?.native) {
    increaseAllowanceMessages.push(createIncreaseAllowanceMessage({
      tokenAmount: amountA,
      tokenAddress: tokenA?.token_address,
      senderAddress: sender,
      swapAddress: stakingProxy,
    }))
  }
  if (!tokenB?.native) {
    increaseAllowanceMessages.push(createIncreaseAllowanceMessage({
      tokenAmount: amountB,
      tokenAddress: tokenB?.token_address,
      senderAddress: sender,
      swapAddress: stakingProxy,
    }))
  }

  return [
    ...increaseAllowanceMessages,
    createExecuteMessage({
      senderAddress: sender,
      contractAddress: stakingProxy,
      message: createLpMsg({
        tokenA,
        tokenB,
        amountA,
        amountB,
        bondingDays,
        pairAddress,
        minUnbondingDuration,
      }),
      funds: [
        tokenA?.native && coin(amountA, tokenA?.denom),
        tokenB?.native && coin(amountB, tokenB?.denom),
      ].
        filter(Boolean).
        sort((a, b) => a.denom.localeCompare(b.denom)),
    }),
  ]
}

export default createLpMsg
