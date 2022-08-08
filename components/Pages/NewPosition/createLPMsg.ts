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
  const asset1 = createAsset(amountA, tokenA);
  const asset2 = createAsset(amountB, tokenB);

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
  const asset1 = createAsset(amountA, tokenA?.token_address);
  const isNativeA = isNativeAsset(asset1.info);

  const asset2 = createAsset(amountB, tokenB?.token_address);
  const isNativeB = isNativeAsset(asset2.info);


  const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []

    /* increase allowance for each non-native token */
    if (!isNativeA) {
      increaseAllowanceMessages.push(
        createIncreaseAllowanceMessage({
          tokenAmount: amountA,
          tokenAddress: tokenA?.token_address,
          senderAddress : sender,
          swapAddress,
        })
      )
    }
    if (!isNativeB) {
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
    message: createLpMsg({ tokenA: tokenA?.token_address, tokenB : tokenB?.token_address, amountA, amountB }),
    funds: [
      isNativeA && coin(amountA, tokenA?.denom),
      isNativeB && coin(amountB, tokenB?.denom),
    ].filter(Boolean),
  })]
}

export default createLpMsg