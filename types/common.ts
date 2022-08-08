import { Msg } from "@terra-money/terra.js";
import { PairResponse , Asset, Pair} from "./terraswap";
import {Network} from './network'

export type ContractVariables = {
  contract: string;
  msg: object;
};

export interface TxResult {
  height: number;
  raw_log: string[];
  txhash: string;
}

export interface TxError {
  code: number;
  message?: string;
}

export interface Tx {
  id: number;
  msgs: Msg[];
  origin: string;
  result: TxResult;
  success: boolean;
  error: TxError;
}

export interface Response<T> {
  error: boolean;
  message: string | null;
  data: T | null;
}

export enum NetworkType {
  classic = "classic",
  Testnet = "testnet",
}

export type Networks = Record<NetworkType, Network>;

// New

export type HumanAddr = string;
export type CanonicalAddr = string;
export type CW20Addr = string;

export type StableDenom = string;
export type bAssetDenom = string;
export type AssetDenom = string;
export type Denom = StableDenom | bAssetDenom | AssetDenom;

export type WASMContractResult<T extends {} = {}> = {
  Result: string;
} & T;

export type VaultPool = {
  assets: [Asset, Asset];
  total_share: string;
  total_value_in_ust: string;
};

export type Token = {
  protocol: string;
  symbol: string;
  token: string;
  icon: string;
};

export type Tokens = {
  [token: string]: Token;
};

export type Routes = {
  [from: string]: {
    [to: string]: Pair;
  };
};

export type Route = {
  contract_addr: string;
  from: string;
  to: string;
  children: Route[];
};

export type DataNetwork = {
  tokens: Tokens;
  pairs: PairResponse[];
};

export type Data = {
  mainnet: DataNetwork;
  testnet: DataNetwork;
} & { [key: string]: DataNetwork };
