import {JsonObject} from "@cosmjs/cosmwasm-stargate";
import {ExecuteResult} from "@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient";
import {Coin} from "@cosmjs/launchpad";
import {EncodeObject} from "@cosmjs/proto-signing";
import {parseRawLog} from "@cosmjs/stargate/build/logs";
import {Coin as StationCoin, Msg, MsgExecuteContract, MsgTransfer, TxInfo} from "@terra-money/terra.js";
import {LCDClient} from "@terra-money/terra.js/dist/client/lcd/LCDClient";
import {ConnectedWallet} from "@terra-money/wallet-provider";
import axios from "axios";

import {TxResponse, Wallet} from "./wallet";

export class TerraStationWallet implements Wallet {
  client: ConnectedWallet
  lcdClient: LCDClient
  network: string

  constructor(client: ConnectedWallet, lcdClient: LCDClient, network: string) {
    this.client = client;
    this.lcdClient = lcdClient;
    this.network = network;
  }

  convertType(type: string): string {
    switch (type) {
      case '/cosmwasm.wasm.v1.MsgExecuteContract':
        return 'wasm/MsgExecuteContract'
      default:
        return type
    }
  }

  convertMsg(msg: EncodeObject) {
    switch (msg.typeUrl) {
      case '/cosmwasm.wasm.v1.MsgExecuteContract':
        return new MsgExecuteContract(
          msg.value.sender,
          msg.value.contract,
          JSON.parse(String.fromCharCode.apply(null, msg.value.msg)),
          msg.value.funds.map(coin => new StationCoin(coin.denom, coin.amount))
        )
      case '/ibc.applications.transfer.v1.MsgTransfer':
        // This needs testing when there are IBC functions in the application
        console.warn('Untested IBC msg transfer with terra station')
        return new MsgTransfer(
          msg.value.sourcePort,
          msg.value.sourceChannel,
          new StationCoin(msg.value.token.denom, msg.value.token.amount),
          msg.value.senderAddress,
          msg.value.receiver,
          msg.value.timeoutHeight,
          msg.value.timeoutTimestamp
        )
      default:
        // This needs testing when there are other message types in the application
        console.warn(`Untested ${msg.typeUrl} msg with terra station`)
        return Msg.fromAmino(
          {
            // @ts-ignore
            type: this.convertType(msg.typeUrl),
            value: msg.value
          })
    }
  }

  post(senderAddress: string, msgs: EncodeObject[], memo: string | undefined): Promise<TxResponse> {
    return this.client.post({
      msgs: msgs.map(msg => this.convertMsg(msg)),
      memo: memo
    }).then(result => {
      return {
        height: result.result.height.valueOf(),
        code: result.success ? 0 : -1,
        transactionHash: result.result.txhash,
        rawLog: result.result.raw_log
      }
    })
  }

  execute(senderAddress: string, contractAddress: string, msg: Record<string, unknown>, funds: readonly Coin[] | undefined): Promise<ExecuteResult> {
    const executeMsg = new MsgExecuteContract(
      senderAddress,
      contractAddress,
      msg,
      funds.map(coin => new StationCoin(coin.denom, coin.amount))
    )
    return this.client.post({
      msgs: [executeMsg]
    }).then(result => {
      return {
        height: result.result.height.valueOf(),
        code: result.success ? 0 : -1,
        transactionHash: result.result.txhash,
        rawLog: result.result.raw_log
      }
    }).then(result => {
      if (!!result.code) {
        throw new Error(`Error when broadcasting tx ${result.transactionHash} at height ${result.height}. Code: ${result.code}; Raw log: ${result.rawLog}`)
      } else {
        return result;
      }
    }).then(result => {
        return {
          logs: parseRawLog(result.rawLog),
          transactionHash: result.transactionHash
        }
      })
  }

  queryContractSmart(address: string, queryMsg: Record<string, unknown>): Promise<JsonObject> {
    return this.lcdClient.wasm.contractQuery(address, queryMsg);
  }

  simulate(signerAddress: string, messages: readonly EncodeObject[], memo: string | undefined): Promise<number> {
    let tx = {
        msgs: messages
          .map(msg => Msg.fromAmino(
            {
              // @ts-ignore
              type: this.convertType(msg.typeUrl),
              value: msg.value
            }))
          .map(msg => {
            if (msg instanceof MsgExecuteContract) {
              msg.execute_msg = JSON.parse(String.fromCharCode.apply(null, msg.execute_msg))
            }
            return msg
          }),
        memo: memo
    };

    // @ts-ignore
    return this.lcdClient.auth.accountInfo(signerAddress).then(result => {
      return this.lcdClient.tx.estimateFee([{
        publicKey: result.getPublicKey(),
        sequenceNumber: result.getSequenceNumber()
      }], tx)
    }).then(result => {
      return result.amount.get("uluna").amount.toNumber()
    }).catch(err => {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response.data.message)
      }
      throw err
    })
  }

  getChainId(): Promise<String> {
    return Promise.resolve(this.lcdClient.config.chainID);
  }

  getNetwork(): Promise<String> {
    return Promise.resolve(this.network);
  }

  getBalance(address: string, searchDenom: string): Promise<Coin> {
    return this.lcdClient.bank.balance(address)
      .then(([coins]) => {
        const coin = coins.get(searchDenom)
        if(coin === undefined){
          return {
            denom: searchDenom,
            amount: '0'
          }
        }
        return {
          denom: coin.denom,
          amount: coin.amount.toString()
        }
    });
  }

  getTx(txHash: string): Promise<TxInfo> {
    return this.lcdClient.tx.txInfo(txHash)
  }

}
