import { JsonObject } from '@cosmjs/cosmwasm-stargate'
import {
  ExecuteResult,
  SigningCosmWasmClient,
} from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { Coin } from '@cosmjs/launchpad'
import {
  EncodeObject,
  OfflineDirectSigner,
  OfflineSigner,
} from '@cosmjs/proto-signing'
import { SigningStargateClientOptions } from '@cosmjs/stargate/build/signingstargateclient'
import { Network } from '@injectivelabs/networks'
import {
  AuthInfo,
  Fee,
  ModeInfo,
  SignerInfo,
  SimplePublicKey,
  Coin as StationCoin,
  Tx,
  TxBody,
  TxInfo,
} from '@terra-money/terra.js'
import { GetTxResponse } from 'cosmjs-types/cosmos/tx/v1beta1/service'

import Injective from '../../services/injective'
import { TxResponse, Wallet } from './wallet'
export class OfflineSigningWallet implements Wallet {
  client: SigningCosmWasmClient | Injective

  network: string

  constructor(
    client: SigningCosmWasmClient | Injective,
    network?: string,
    activeWallet?: string
  ) {
    this.client = client
    this.network = network
  }

  static connectWithSigner(
    chainId: string,
    endpoint: string,
    signer: OfflineSigner & OfflineDirectSigner,
    network: string,
    options?: SigningStargateClientOptions,
    activeWallet?: string
  ): Promise<OfflineSigningWallet> {
    if (chainId.includes('injective')) {
      const injectiveClient = new Injective(
        signer,
        activeWallet,
        chainId === 'injective-1' ? Network.MainnetK8s : Network.TestnetK8s
      )
      return new Promise((resolve, reject) => {
        resolve(new OfflineSigningWallet(injectiveClient, network))
      })
    }

    return SigningCosmWasmClient.connectWithSigner(
      endpoint,
      signer,
      options
    ).then((client) => new OfflineSigningWallet(client, network))
  }

  post(
    senderAddress: string,
    msgs: EncodeObject[],
    memo?: string
  ): Promise<TxResponse> {
    return this.client.signAndBroadcast(senderAddress, msgs, 'auto', memo)
  }

  execute(
    senderAddress: string,
    contractAddress: string,
    msg: Record<string, unknown>,
    funds: readonly Coin[] | undefined
  ): Promise<ExecuteResult> {
    return this.client.execute(
      senderAddress,
      contractAddress,
      msg,
      'auto',
      undefined,
      funds
    )
  }

  queryContractSmart(
    address: string,
    queryMsg: Record<string, unknown>
  ): Promise<JsonObject> {
    return this.client.queryContractSmart(address, queryMsg)
  }

  simulate(
    signerAddress: string,
    messages: readonly EncodeObject[] | Record<string, unknown>,
    memo: string | undefined
  ): Promise<number> {
    return this.client.simulate(signerAddress, messages, memo)
  }

  getChainId(): Promise<string> {
    return this.client.getChainId()
  }

  getNetwork(): Promise<string> {
    return Promise.resolve(this.network)
  }

  getBalance(address: string, searchDenom: string): Promise<Coin> {
    return this.client.getBalance(address, searchDenom)
  }

  getTx(txHash: string): Promise<TxInfo> {
    if (this.client.getTx) return this.client.getTx(txHash)

    // @ts-ignore
    const promise: Promise<GetTxResponse> =
      this.client.queryClient.tx.getTx(txHash)
    return promise.then((result) => {
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
            result.tx.body.timeoutHeight.toNumber()
          ),
          new AuthInfo(
            result.tx.authInfo.signerInfos.map(
              (signerInfo) =>
                new SignerInfo(
                  new SimplePublicKey(
                    String.fromCharCode.apply(null, signerInfo.publicKey.value)
                  ),
                  signerInfo.sequence.toNumber(),
                  // @ts-ignore
                  ModeInfo.fromData(signerInfo.modeInfo)
                )
            ),
            new Fee(
              result.tx.authInfo.fee.gasLimit.toNumber(),
              result.tx.authInfo.fee.amount.map(
                (coin) => new StationCoin(coin.denom, coin.amount)
              )
            )
          ),
          result.tx.signatures.map((sig) =>
            String.fromCharCode.apply(null, sig)
          )
        ),
        timestamp: result.txResponse.timestamp,
      }
    })
  }
}
