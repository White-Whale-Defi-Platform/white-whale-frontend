import {
  MsgExecuteContractEncodeObject
} from '@cosmjs/cosmwasm-stargate';
import { coin } from "@cosmjs/proto-signing";
import { createExecuteMessage } from 'util/messages';
import { createAsset, isNativeAsset } from "../../../services/asset";

import {
  createIncreaseAllowanceMessage
} from 'util/messages';


const createLpMsg = ({ tokenA, tokenB, amountA, amountB }) => {
  const asset1 = createAsset(amountA, tokenA?.token_address, tokenA?.native);
  const asset2 = createAsset(amountB, tokenB?.token_address, tokenB?.native);

  return {
    "provide_liquidity": {
      "assets": [asset1, asset2]
    }
  }
}

export const createLPExecuteMsgs = (
  { swapAddress, tokenA, tokenB, amountA, amountB },
  sender: string,
) => {


  const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []

    /* increase allowance for each non-native token */
    if (!tokenA?.native) {
      increaseAllowanceMessages.push(
        createIncreaseAllowanceMessage({
          tokenAmount: amountA,
          tokenAddress: tokenA?.token_address,
          senderAddress : sender,
          swapAddress,
        })
      )
    }
    if (!tokenB?.native) {
      increaseAllowanceMessages.push(
        createIncreaseAllowanceMessage({
          tokenAmount: amountB,
          tokenAddress: tokenB?.token_address,
          senderAddress : sender,
          swapAddress,
        })
      )
    }

  return [
    ...increaseAllowanceMessages,
    createExecuteMessage({
    senderAddress: sender,
    contractAddress: swapAddress,
    message: createLpMsg({ tokenA, tokenB, amountA, amountB }),
    funds: [
      tokenA?.native && coin(amountA, tokenA?.denom),
      tokenB?.native && coin(amountB, tokenB?.denom),
    ].filter(Boolean),
  })]
}

export default createLpMsg