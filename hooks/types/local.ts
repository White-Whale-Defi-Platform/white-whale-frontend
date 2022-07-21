import { PairResponse } from "./terraswap";

export type Token = {
  protocol: string;
  symbol: string;
  token: string;
  icon: string;
};

export type Tokens = {
  [token: string]: Token;
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
