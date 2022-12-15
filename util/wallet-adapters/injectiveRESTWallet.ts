import { 
    MsgSend,
    ChainRestAuthApi,
    ChainRestTendermintApi,
    BaseAccount,
    createTransaction,
    BroadcastMode
  } from '@injectivelabs/sdk-ts'
  import {KeplrWallet} from '@injectivelabs/cosmos-ts'
  import { DEFAULT_STD_FEE, DEFAULT_BLOCK_TIMEOUT_HEIGHT } from '@injectivelabs/utils'
  import { ChainId } from '@injectivelabs/ts-types'
import { Network, getEndpointsForNetwork } from '@injectivelabs/networks'
import { TxResponse, Wallet } from './wallet'
import { Coin } from '@cosmjs/amino'
import { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import { EncodeObject } from '@cosmjs/proto-signing'
import { TxInfo } from '@terra-money/terra.js'
import { HttpBatchClient, Tendermint34Client } from "@cosmjs/tendermint-rpc";
  const getKeplr = async (chainId) => {
    await window.keplr.enable(chainId);
      
    const offlineSigner = window.keplr.getOfflineSigner(chainId);
    const accounts = await offlineSigner.getAccounts();
    const key = await window.keplr.getKey(chainId);
  
    return { offlineSigner, accounts, key }
  }
  export class InjectiveRESTWallet implements Wallet {
    client: ChainRestAuthApi;
    httpClient: Tendermint34Client;
    chainId: string;

    connectClient = async (chainId: string, network: Network) => {

        const endpoints = getNetworkEndpoints(network);
        const client = new ChainRestAuthApi(endpoints.rest)
        const { offlineSigner, accounts, key } = await getKeplr(chainId);
        const injectiveAddress = accounts[0].address;
        const accountDetailsResponse = await client.fetchAccount(injectiveAddress);
        const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse);

        console.log(injectiveAddress);
        console.log(accountDetailsResponse);

        this.client = client
        const httpClient = new HttpBatchClient(endpoints.sentryHttpApi ?? "");
	    const tmClient = await Tendermint34Client.create(httpClient);
        this.httpClient = tmClient
        this.chainId = chainId
    }

    post(senderAddress: string, msgs: EncodeObject[], memo?: string): Promise<TxResponse>{
        const { offlineSigner, accounts, key } = await getKeplr(this.chainId);

        const { signBytes, txRaw } = createTransaction({
            key,
            this.chainId,
            fee: DEFAULT_STD_FEE,
            message: msg.toDirectSign(),
            sequence: baseAccount.sequence,
            timeoutHeight: timeoutHeight.toNumber(),
            accountNumber: baseAccount.accountNumber,
        });
        return Promise
    };
    execute: (senderAddress: string, contractAddress: string, msg: Record<string, unknown>, funds?: readonly Coin[]) => Promise<ExecuteResult>
    queryContractSmart: (address: string, queryMsg: Record<string, unknown>) => Promise<any>
    simulate: (signerAddress: string, messages: readonly EncodeObject[], memo: string) => Promise<number>
    getChainId: () => Promise<String>
    getNetwork: () => Promise<String>
    getBalance: (address: string, searchDenom: string) => Promise<Coin>
    getTx: (txHash: string) => Promise<TxInfo>
    
  }