import {JsonObject} from "@cosmjs/cosmwasm-stargate";
import {ExecuteResult, SigningCosmWasmClient} from "@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient";
import {Coin} from "@cosmjs/launchpad";
import {EncodeObject, OfflineSigner} from "@cosmjs/proto-signing";
import {SigningStargateClientOptions} from "@cosmjs/stargate/build/signingstargateclient";
import {
  AuthInfo,
  Coin as StationCoin,
  Fee,
  ModeInfo,
  SignerInfo,
  SimplePublicKey,
  Tx,
  TxBody,
  TxInfo
} from "@terra-money/terra.js";
import {GetTxResponse} from "cosmjs-types/cosmos/tx/v1beta1/service";

import {TxResponse, Wallet} from "./wallet";

export class OfflineSigningWallet implements Wallet {
  client: SigningCosmWasmClient
  network: string

  constructor(client: SigningCosmWasmClient, network: string) {
    this.client = client;
    this.network = network
  }

  static connectWithSigner(endpoint: string, signer: OfflineSigner, network: string, options?: SigningStargateClientOptions): Promise<OfflineSigningWallet> {
    return SigningCosmWasmClient.connectWithSigner(endpoint, signer, options)
      .then(client => new OfflineSigningWallet(client, network))
  }

  post(senderAddress: string, msgs: EncodeObject[], memo?: string): Promise<TxResponse> {
    return this.client.signAndBroadcast(senderAddress, msgs, "auto", memo)
  }

  execute(senderAddress: string, contractAddress: string, msg: Record<string, unknown>, funds: readonly Coin[] | undefined): Promise<ExecuteResult> {
    return this.client.execute(senderAddress, contractAddress, msg, "auto", undefined, funds);
  }

  queryContractSmart(address: string, queryMsg: Record<string, unknown>): Promise<JsonObject> {
    return this.client.queryContractSmart(address, queryMsg);
  }

  simulate(signerAddress: string, messages: readonly EncodeObject[], memo: string | undefined): Promise<number> {
    return this.client.simulate(signerAddress, messages, memo);
  }

  getChainId(): Promise<String> {
    return this.client.getChainId();
  }

  getNetwork(): Promise<String> {
    return Promise.resolve(this.network);
  }

  getBalance(address: string, searchDenom: string): Promise<Coin>{
    return this.client.getBalance(address, searchDenom)
  }

  getTx(txHash: string): Promise<TxInfo> {
    // @ts-ignore
    const promise: Promise<GetTxResponse> = this.client.queryClient.tx.getTx(txHash);
    return promise
      .then(result => {
        return {
          height: result.txResponse.height.toNumber(),
          txhash: result.txResponse.txhash.toString(),
          raw_log: result.txResponse.rawLog,
          logs: undefined,
          gas_wanted: result.txResponse.gasWanted.toNumber(),
          gas_used: result.txResponse.gasUsed.toNumber(),
          tx: new Tx(
            new TxBody(
              [],
              result.tx.body.memo,
              result.tx.body.timeoutHeight.toNumber()),
            new AuthInfo(
              result.tx.authInfo.signerInfos.map(signerInfo =>
                new SignerInfo(
                  new SimplePublicKey(String.fromCharCode.apply(null, signerInfo.publicKey.value)),
                  signerInfo.sequence.toNumber(),
                  // @ts-ignore
                  ModeInfo.fromData(signerInfo.modeInfo)
                )),
              new Fee(
                result.tx.authInfo.fee.gasLimit.toNumber(),
                result.tx.authInfo.fee.amount.map(coin => new StationCoin(coin.denom, coin.amount))
              )
            ),
            result.tx.signatures.map(sig => String.fromCharCode.apply(null, sig))),
          timestamp: result.txResponse.timestamp
        }
      })
  }

}
