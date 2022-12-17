import {
    ChainGrpcWasmApi,
    TxRestClient,
    ChainRestBankApi,
    createTransaction,
    ChainRestAuthApi,
    ChainRestTendermintApi,
    BaseAccount,
    createTxRawFromSigResponse,
    createCosmosSignDocFromTransaction,
    TxRaw,
} from '@injectivelabs/sdk-ts'
import { DEFAULT_STD_FEE, DEFAULT_BLOCK_TIMEOUT_HEIGHT, BigNumberInBase } from '@injectivelabs/utils'
import { ChainId } from '@injectivelabs/ts-types'
import { Network, getNetworkEndpoints } from '@injectivelabs/networks'
import { MsgExecuteContract } from '@injectivelabs/sdk-ts'
import { Coin, EncodeObject, OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing'
import { AccountDetails } from '@injectivelabs/sdk-ts/dist/types/auth'
import { base64ToJson } from '../util/base64'

type SimulateResponse = {
    result: {
        data: string;
        log: string;
        eventsList: {
            type: string;
            attributes: {
                key: string;
                value: string;
            }[];
        }[];
    };
    gasInfo: {
        gasWanted: number;
        gasUsed: number;
    };
}

class Injective {
    txClient: TxRestClient;
    wasmApi: ChainGrpcWasmApi
    bankApi: ChainRestBankApi
    offlineSigner: OfflineSigner & OfflineDirectSigner
    pubKey: string
    baseAccount: BaseAccount
    account: AccountDetails
    chainId: ChainId
    txRaw: TxRaw

    constructor(offlineSigner: OfflineSigner & OfflineDirectSigner) {
        const endpoints = getNetworkEndpoints(Network.TestnetK8s);

        this.offlineSigner = offlineSigner
        this.txClient = new TxRestClient(endpoints.rest)
        this.wasmApi = new ChainGrpcWasmApi(endpoints.grpc)
        this.bankApi = new ChainRestBankApi(endpoints.rest)
        this.chainId = ChainId.Testnet
        this.init()
    }

    async init() {
        const key = await window.keplr.getKey(this.chainId);
        this.pubKey = Buffer.from(key.pubKey).toString('base64')
        const restEndpoint = getNetworkEndpoints(Network.Testnet).rest
        const chainRestAuthApi = new ChainRestAuthApi(restEndpoint)
        const [{ address }] = await this.offlineSigner.getAccounts();
        const accountDetailsResponse = await chainRestAuthApi.fetchAccount(address)
        this.baseAccount = BaseAccount.fromRestApi(accountDetailsResponse)
        this.account = this.baseAccount.toAccountDetails()
    }

    getBalance(address: string, searchDenom: string) {
        return this.bankApi.fetchBalance(address, searchDenom)
    }

    getChainId() {
        return this.chainId
    }

    getNetwork() {
        return Network.TestnetK8s
    }

    async getTx(txHash: string) {
        const response = await this.txClient.fetchTx(txHash)
        console.log({ response })
        return response
    }


    async prepair(messages: EncodeObject[]) {
        try {
            await this.init()
            const restEndpoint = getNetworkEndpoints(Network.Testnet).rest
            const chainRestTendermintApi = new ChainRestTendermintApi(restEndpoint)
            const latestBlock = await chainRestTendermintApi.fetchLatestBlock()
            const latestHeight = latestBlock.header.height
            const timeoutHeight = new BigNumberInBase(latestHeight).plus(DEFAULT_BLOCK_TIMEOUT_HEIGHT)

            const [message] = messages
            console.log(message)
            console.log({ message })
            const { msg, contract, funds } = message?.value || {}
            const msgString = Buffer.from(message?.value?.msg).toString('utf8')
            const jsonMessage = JSON.parse(msgString)

            console.log({ jsonMessage })

            const [[action, msgs]] = Object.entries(jsonMessage)


            const executeMessageJson = {
                action,
                msg: msgs as object
            }
            console.log({ executeMessageJson })

            const params = {
                funds: funds?.[0],
                sender: this.account.address,
                contractAddress: contract,
                exec: executeMessageJson,
            };
            console.log({ params })


            const MessageExecuteContract = MsgExecuteContract.fromJSON(params)

            return createTransaction({
                pubKey: this.pubKey,
                chainId: this.chainId,
                fee: DEFAULT_STD_FEE,
                message: MessageExecuteContract.toDirectSign(),
                sequence: this.baseAccount.sequence,
                timeoutHeight: timeoutHeight.toNumber(),
                accountNumber: this.baseAccount.accountNumber,
            })

        }
        catch (error) {
            console.log({ error })
            throw new Error(error?.errorMessage)
        }
    }


    async simulate(
        signerAddress: string,
        messages: EncodeObject[],
        memo: string | undefined
    ) {

        try {
            console.log({ messages })
            this.txRaw = null
            const { txRaw } = await this.prepair(messages)
            this.txRaw = txRaw
            txRaw.addSignatures('')
            return await this.txClient.simulate(txRaw).then(({ gasInfo }: SimulateResponse) => gasInfo.gasUsed)
        } catch (error) {
            console.log({ error })
            throw new Error(error?.errorMessage)
        }
    }

    async queryContractSmart(
        address: string,
        queryMsg: Record<string, unknown>
    ) {
        return this.wasmApi.fetchSmartContractState(address, Buffer.from(
            JSON.stringify(queryMsg),
        ).toString('base64'))
            .then(({ data }) => base64ToJson(data as string))

    }

    async execute(
        senderAddress: string,
        contractAddress: string,
        msg: Record<string, unknown>,
        funds?: Coin[]
    ) {

        try {
            const signDoc = createCosmosSignDocFromTransaction({
                txRaw: this.txRaw,
                accountNumber: this.baseAccount.accountNumber,
                chainId: this.chainId
            })

            const directSignResponse = await this.offlineSigner?.signDirect(this.account.address, signDoc)
            const signTxRaw = createTxRawFromSigResponse(directSignResponse)
            this.txRaw = null
            return this.txClient.broadcast(signTxRaw)
        }
        catch (error) {
            console.log({ error })
            throw new Error(error?.errorMessage)
        }

    }
}

export default Injective