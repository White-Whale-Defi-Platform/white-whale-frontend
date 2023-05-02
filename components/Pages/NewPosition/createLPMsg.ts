import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { coin } from '@cosmjs/proto-signing'
import { createExecuteMessage } from 'util/messages'
import { createIncreaseAllowanceMessage } from 'util/messages'
import { num } from '../../../libs/num'

import { createAsset, isNativeAsset } from '../../../services/asset'

const NUMBER_OF_SECONDS_IN_DAY = 86400

const createLpMsg = ({ tokenA, tokenB, amountA, amountB, bondingDays }) => {
  const asset1 = createAsset(amountA, tokenA?.token_address, tokenA?.native)
  const asset2 = createAsset(amountB, tokenB?.token_address, tokenB?.native)

  return {
    deposit: {
      assets: [asset1, asset2],
      pair_address: "migaloo1y08qghmj3djn7felsetgz63lwpfqdu7agcel7syglg5n84n730asyfjwtj",
      unbonding_duration: 86400
      // unbonding_duration: num(bondingDays).times(NUMBER_OF_SECONDS_IN_DAY).toNumber()
    },
  }
}

export const createLPExecuteMsgs = (
  { swapAddress, tokenA, tokenB, amountA, amountB, bondingDays },
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
        swapAddress : "migaloo1epam4fazfduqrn3w23ta3aduam20gkx0kj3vdgx8lzfa7zujhnds325pxa",
      })
    )
  }
  if (!tokenB?.native) {
    increaseAllowanceMessages.push(
      createIncreaseAllowanceMessage({
        tokenAmount: amountB,
        tokenAddress: tokenB?.token_address,
        senderAddress: sender,
        swapAddress : "migaloo1epam4fazfduqrn3w23ta3aduam20gkx0kj3vdgx8lzfa7zujhnds325pxa",
      })
    )
  }

  return [
    ...increaseAllowanceMessages,
    createExecuteMessage({
      senderAddress: sender,
      contractAddress: swapAddress,
      message: createLpMsg({ tokenA, tokenB, amountA, amountB, bondingDays }),
      funds: [
        tokenA?.native && coin(amountA, tokenA?.denom),
        tokenB?.native && coin(amountB, tokenB?.denom),
      ].filter(Boolean),
    }),
  ]
}

export default createLpMsg
