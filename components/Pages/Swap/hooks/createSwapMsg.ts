// import { toBase64 } from "@arthuryeti/terra";
import { LCDClient } from "@terra-money/terra.js";
// import { Coin } from 'hooks/useCosmWasmClient'
import { Coin } from '@cosmjs/launchpad'
import { coin, EncodeObject } from "@cosmjs/proto-signing";

import { isNativeAsset, toAsset, createAsset } from "services/asset";

import { Route, SimulationResponse, ReverseSimulationResponse } from "types";
import { createExecuteMessage } from 'util/messages';

export const toBase64 = (obj: object) => {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}


type GetQueryParams = {
  client: LCDClient;
  swapRoute: Route[];
  token: string;
  isNative: boolean;
  amount: string;
  reverse?: boolean;
};

export const simulate = ({
  client,
  swapRoute,
  isNative,
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
        ask_asset: toAsset({ token, amount, isNative }),
      },
    });
  }

  return client.wasm.contractQuery<SimulationResponse>(contract_addr, {
    simulation: {
      offer_asset: toAsset({ token, amount, isNative }),
    },
  });
};

type CreateSwapMsgsOpts = {
  // swapRoute: any[];
  token: string;
  amount: string;
  isNative: boolean;
  slippage: string;
  price: string;
  swapAddress: string;
  denom: string;
};

export const createMsg = ({ token, amount, slippage, price, swapAddress, isNative }) => {
  const offerAsset = createAsset(amount, token, isNative);
  // const isNative = isNativeAsset(offerAsset.info);

  const addSlippage = (obj) => {
    if (slippage === '0') return obj
    else return {
      ...obj,
      max_spread: slippage
    }
  }

  if (isNative) {
    return {
      swap: addSlippage({
        offer_asset: offerAsset,
        belief_price: price,
      })
    }
  }

  return {
    send: {
      amount,
      contract: swapAddress,
      msg: toBase64({
        swap: addSlippage({
          belief_price: price,
        }),
      }),
    },
  }

}


export const createSwapMsgs = (
  { token, amount, slippage, price, swapAddress, denom , isNative}: CreateSwapMsgsOpts,
  sender: string,
) => {
  // const [{ contract_addr }] = swapRoute;
  const offerAsset = createAsset(amount, token, isNative);
  // const isNative = isNativeAsset(offerAsset.info);

  return createExecuteMessage({
    senderAddress: sender,
    contractAddress: isNative ? swapAddress : token,
    message: createMsg({ token, amount, slippage, price, swapAddress, isNative }),
    funds: isNative ? [coin(amount, denom)] : []
  })
};
