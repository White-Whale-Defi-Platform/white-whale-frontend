// import { toBase64 } from "@arthuryeti/terra";
// import { LCDClient, Coin, MsgExecuteContract } from "@terra-money/terra.js";
// import { Coin } from 'hooks/useCosmWasmClient'
import { Coin } from '@cosmjs/launchpad'
import { coin, EncodeObject } from "@cosmjs/proto-signing";

import { isNativeAsset, toAsset, createAsset } from "./asset";

import { Route, SimulationResponse, ReverseSimulationResponse } from "./types";
import { createExecuteMessage } from '../util/messages';

export const toBase64 = (obj: object) => {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}


type GetQueryParams = {
  client: LCDClient;
  swapRoute: Route[];
  token: string;
  amount: string;
  reverse?: boolean;
};

export const simulate = ({
  client,
  swapRoute,
  token,
  amount,
  reverse = false,
}: GetQueryParams) => {
  if (swapRoute[0] == null) {
    return null;
  }

  const { contract_addr } = swapRoute[0];

  if (reverse) {
    return client.wasm.contractQuery<ReverseSimulationResponse>(contract_addr, {
      reverse_simulation: {
        ask_asset: toAsset({ token, amount }),
      },
    });
  }

  return client.wasm.contractQuery<SimulationResponse>(contract_addr, {
    simulation: {
      offer_asset: toAsset({ token, amount }),
    },
  });
};

type CreateSwapMsgsOpts = {
  // swapRoute: any[];
  token: string;
  amount: string;
  slippage: string;
  price: string;
  swapAddress: string;
  denom: string;
};

export const createMsg = ({ token, amount, slippage, price, swapAddress }) => {
  const offerAsset = createAsset(amount, token);
  const isNative = isNativeAsset(offerAsset.info);

  console.log({token, amount, slippage, price, swapAddress})

  if (isNative) {
    return {
      swap: {
        offer_asset: offerAsset,
        max_spread: slippage,
        belief_price: price,
      },
    }
  }

  return {
    send: {
      amount,
      contract: swapAddress,
      msg: toBase64({
        swap: {
          max_spread: slippage,
          belief_price: price,
        },
      }),
    },
  }

}


export const createSwapMsgs = (
  { token, amount, slippage, price, swapAddress , denom}: CreateSwapMsgsOpts,
  sender: string,
) => {
  // const [{ contract_addr }] = swapRoute;
  const offerAsset = createAsset(amount, token);
  const isNative = isNativeAsset(offerAsset.info);

  console.log({isNative, token, amount, slippage, price, swapAddress,})

  return createExecuteMessage({
    senderAddress: sender,
    contractAddress: isNative ? swapAddress :token,
    message: createMsg({ token, amount, slippage, price, swapAddress }),
    funds : isNative ? [coin(amount, denom)] : []
  })


  // if (isNative) {
  //   return createExecuteMessage({
  //     senderAddress: sender,
  //     contractAddress: swapAddress,
  //     message: swapMessage,
  //     funds
  //   })
  //   // return [
  //   //   new MsgExecuteContract(
  //   //     sender,
  //   //     contract_addr,
  //   //     {
  //   //       swap: {
  //   //         offer_asset: offerAsset,
  //   //         max_spread: slippage,
  //   //         belief_price: price,
  //   //       },
  //   //     },
  //   //     [new Coin(token, amount)],
  //   //   ),
  //   // ];
  // }

  // return [
  //   // new MsgExecuteContract(sender, token, {
  //   //   send: {
  //   //     amount,
  //   //     contract: contract_addr,
  //   //     msg: toBase64({
  //   //       swap: {
  //   //         max_spread: slippage,
  //   //         belief_price: price,
  //   //       },
  //   //     }),
  //   //   },
  //   // }),
  // ];
};
