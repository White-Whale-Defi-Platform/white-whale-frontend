import {
    TxRestClient,
    createTransaction,
    ChainRestAuthApi,
    ChainRestTendermintApi,
    BaseAccount,
    createTxRawFromSigResponse,
    createCosmosSignDocFromTransaction,
  } from '@injectivelabs/sdk-ts'
  import { DEFAULT_STD_FEE, DEFAULT_BLOCK_TIMEOUT_HEIGHT, BigNumberInBase } from '@injectivelabs/utils'
  import { ChainId } from '@injectivelabs/ts-types'
  import { Network, getNetworkEndpoints } from '@injectivelabs/networks'
  import { MsgExecuteContract } from '@injectivelabs/sdk-ts'
  
  
  const endpoints = getNetworkEndpoints(Network.TestnetK8s);
  
  
      const txClient = new TxRestClient(endpoints.rest)
      const router = "inj1ckqz4r0n3m9smvharm65pgu8mm7vhep8cq89mg"
  
      const getKeplr = async (chainId) => {
        await window.keplr.enable(chainId);
  
        const offlineSigner = window.keplr.getOfflineSigner(chainId);
        const accounts = await offlineSigner.getAccounts();
        const key = await window.keplr.getKey(chainId);
        const pubKey = Buffer.from(key.pubKey).toString('base64')
        console.log({ offlineSigner, accounts, key, pubKey })
        return { offlineSigner, accounts, key, pubKey }
      }
  
      const { pubKey, offlineSigner, accounts } = await getKeplr(ChainId.Testnet)
  
      const restEndpoint = getNetworkEndpoints(Network.Testnet).rest
      const chainRestAuthApi = new ChainRestAuthApi(
        restEndpoint,
      )
      const accountDetailsResponse = await chainRestAuthApi.fetchAccount(
        accounts?.[0].address,
      )
      /** Block Details */
      const chainRestTendermintApi = new ChainRestTendermintApi(
        restEndpoint,
      )
      const latestBlock = await chainRestTendermintApi.fetchLatestBlock()
      const latestHeight = latestBlock.header.height
      const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse)
      const accountDetails = baseAccount.toAccountDetails()
      const timeoutHeight = new BigNumberInBase(latestHeight).plus(
        DEFAULT_BLOCK_TIMEOUT_HEIGHT,
      )
  
      const executeMessageJson = {
        "action": "execute_swap_operations",
        "msg": {
          "operations": [
            {
              "terra_swap": {
                "offer_asset_info": {
                  "native_token": {
                    "denom": "inj"
                  }
                },
                "ask_asset_info": {
                  "native_token": {
                    "denom": "peggy0x87aB3B4C8661e07D6372361211B96ed4Dc36B1B5"
                  }
                }
              }
            }
          ]
        }
      }
  
      const params = {
        funds: {
          denom: "inj",
          amount: "1000000000000000000"
        },
        sender: accountDetails.address,
        contractAddress: router,
        exec: executeMessageJson,
      };
  
      const MessageExecuteContract = MsgExecuteContract.fromJSON(params)
  
      /** Prepare the Transaction **/
      const {txRaw} = createTransaction({
        pubKey,
        chainId: ChainId.Testnet,
        fee: DEFAULT_STD_FEE,
        message: MessageExecuteContract.toDirectSign(),
        sequence: baseAccount.sequence,
        timeoutHeight: timeoutHeight.toNumber(),
        accountNumber: baseAccount.accountNumber,
      })
  
  
      const signDoc = createCosmosSignDocFromTransaction({
        txRaw,
        accountNumber: baseAccount.accountNumber,
        chainId: ChainId.Testnet
      })
  
      txRaw.addSignatures('')
      const simulate = await txClient.simulate(txRaw)
      txRaw.clearSignaturesList()
  
      const directSignResponse = await offlineSigner.signDirect(accountDetails.address, signDoc)
      const signTxRaw = createTxRawFromSigResponse(directSignResponse)
      const tx = await txClient.broadcast(signTxRaw)
  
      console.log({simulate, txRaw,tx})