import {JsonObject} from "@cosmjs/cosmwasm-stargate";
import {ExecuteResult} from "@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient";
import {EncodeObject} from "@cosmjs/proto-signing";
import {Coin} from "@cosmjs/stargate";
import {TxInfo} from "@terra-money/terra.js";

export interface Wallet {
  post: (senderAddress: string, msgs: EncodeObject[], memo?: string) => Promise<TxResponse>;
  execute: (senderAddress: string, contractAddress: string, msg: Record<string, unknown>, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  queryContractSmart: (address: string, queryMsg: Record<string, unknown>) => Promise<JsonObject>;
  simulate: (signerAddress: string, messages: readonly EncodeObject[], memo: string | undefined) => Promise<number>;
  getChainId: () => Promise<String>;
  getNetwork: () => Promise<String>;
  getBalance: (address: string, searchDenom: string) => Promise<Coin>;
  getTx: (txHash: string) => Promise<TxInfo>;
}

export interface TxResponse {
  readonly height: number;
  /** Error code. The transaction succeeded if code is 0. */
  readonly code: number;
  readonly transactionHash: string;
  readonly rawLog?: string;
}
