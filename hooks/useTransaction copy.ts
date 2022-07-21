import { useCallback, useState, useEffect, useMemo } from 'react'
// import {
//   Coins,
//   Coin,
//   MsgExecuteContract,
//   CreateTxOptions,
//   Fee,
//   TxInfo,
// } from '@terra-money/terra.js'

import {
  useWallet,
  UserDenied,
  CreateTxFailed,
  TxFailed,
  TxUnspecifiedError,
  Timeout,
} from '@terra-money/wallet-provider'
import { useMutation, useQuery } from 'react-query'
import { coin } from '@cosmjs/stargate'
// import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

// import { useTerraWebapp } from '../context'
import useDebounceValue from './useDebounceValue'
import { directTokenSwap } from '../services/swap'
// import useAddress from './useAddress'
import { useTokenInfo } from './useTokenInfo'
import { useTokenToTokenPrice } from '../features/swap'
import { createSwapMsgs } from './monoSwap'
import { Asset } from '../types/blockchain'
import { useToast } from '@chakra-ui/react'

export enum TxStep {
  /**
   * Idle
   */
  Idle = 0,
  /**
   * Estimating fees
   */
  Estimating = 1,
  /**
   * Ready to post transaction
   */
  Ready = 2,
  /**
   * Signing transaction in Terra Station
   */
  Posting = 3,
  /**
   * Broadcasting
   */
  Broadcasting = 4,
  /**
   * Succesful
   */
  Success = 5,
  /**
   * Failed
   */
  Failed = 6,
}

type Params = {
  swapAddress:string,
  swapAssets: any[],
  price: number,
  client: any
  sender: string
  msgs: any | null
  encodedMsgs: any | null
  amount: string
  gasAdjustment?: number
  estimateEnabled?: boolean
  onBroadcasting?: (txHash: string) => void
  onSuccess?: (txHash: string, txInfo?: any) => void
  onError?: (txHash?: string, txInfo?: any) => void
}

export const useTransaction = ({
  swapAddress,
  swapAssets,
  client,
  sender,
  msgs,
  encodedMsgs,
  amount,
  price,
  // gasAdjustment = 1.2,
  // estimateEnabled = true,
  onBroadcasting,
  onSuccess,
  onError,
}: Params) => {
  // const { client } = useTerraWebapp()
  // const address = useAddress()
  // const { post } = useWallet()
  const debouncedMsgs = useDebounceValue(encodedMsgs, 200)
  const [tokenA, tokenB] = swapAssets
  // const tokenA = useTokenInfo(asset1?.symbol)
  const toast = useToast()

  // const [currentTokenPrice] = useTokenToTokenPrice({
  //   tokenASymbol: asset1?.asset,
  //   tokenBSymbol: asset2.asset,
  //   tokenAmount: Number(asset1.amount) * 1000000
  // })

  const [txStep, setTxStep] = useState<TxStep>(TxStep.Idle)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)
  const [error, setError] = useState<unknown | null>(null)
  // const fee = "auto"
  // console.log({
  //   client,
  //   sender,
  //   msgs,
  //   // gasAdjustment,
  //   // estimateEnabled,
  //   // onBroadcasting,
  //   // onSuccess,
  //   // onError,
  // })


  const { data: fee } = useQuery<unknown, unknown, any | null>(
    ['fee', amount, debouncedMsgs, error], async () => {

      console.log("herere")

      setError(null)
      setTxStep(TxStep.Estimating)
      try {
        const response = await client.simulate(sender, debouncedMsgs, '')
        setTxStep(TxStep.Ready)
        return response
      } catch (error) {
        if (/insufficient funds/i.test(error.toString()) || /Overflow: Cannot Sub with/i.test(error.toString())) {
          console.error(error)
          setTxStep(TxStep.Idle)
          setError("Insufficent funds")
          throw new Error('Insufficent funds')
        } else {
          console.error(error)
          setTxStep(TxStep.Idle)
          setError("Something went wrong")
          throw Error("Something went wrong")
        }
      }
    },
    {
      // debouncedMsgs != null &&
      //   txStep == TxStep.Idle &&
      //   error == null &&
      //   estimateEnabled,
      enabled: debouncedMsgs != null && txStep == TxStep.Idle && error == null,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 0,
      onSuccess: () => {
        setTxStep(TxStep.Ready)
      },
      onError: () => {
        setTxStep(TxStep.Idle)
      },
    }
  )

  // console.log({error})


  // const { data: fee } = useQuery<unknown, unknown, any | null>(
  //   ['fee', debouncedMsgs, error],
  //   async () => {
  //     if (debouncedMsgs == null || txStep != TxStep.Idle || error != null) {
  //       throw new Error('Error in estimaging fee')
  //     }


  //     setError(null)
  //     setTxStep(TxStep.Estimating)

  //     const txOptions = {
  //       msgs: debouncedMsgs,
  //       gasPrices: coin("3500", 'ujunox'),
  //       gasAdjustment,
  //       feeDenoms: ['ujunox'],
  //     }
  //     const accountInfo = await client.queryClient.auth.account(sender)
  //     const sequenceNumber = await client.getSequence(sender)

  //     // console.log({accountInfo, pubKey, sequenceNumber, client })

  //     try {

  //       // client.queryClient


  //       client.queryClient.tx.simulate(
  //         [
  //           {
  //             sequenceNumber,
  //             publicKey: pubKey,
  //           },
  //         ],
  //         txOptions,
  //       )
  //       // client.getTx.estimateFee(
  //       //   [
  //       //     {
  //       //       sequenceNumber: client.getSequence(),
  //       //       publicKey: accountInfo.getPublicKey(),
  //       //     },
  //       //   ],
  //       //   txOptions,
  //       // )
  //     }
  //     catch (err) {
  //       console.log(err)
  //       console.log(client)
  //     }

  //     return {}
  //   },
  //   {
  //     enabled:
  //       !!client && 
  //       debouncedMsgs != null &&
  //       txStep == TxStep.Idle &&
  //       error == null &&
  //       estimateEnabled,
  //     refetchOnWindowFocus: false,
  //     retry: false,
  //     onSuccess: () => {
  //       setTxStep(TxStep.Ready)
  //     },
  //     onError: e => {
  //       // @ts-expect-error - don't know anything about error
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //       if (e?.response?.data?.message) {
  //         // @ts-expect-error - don't know anything about error
  //         // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //         setError(e.response.data.message)
  //       } else {
  //         setError('Something went wrong')
  //       }

  //       setTxStep(TxStep.Idle)
  //     },
  //   }
  // )

  const { mutate } = useMutation(
    (data: any) => {

      //   const reverse = false
      // const amount = '100'
      // const slippage = '0.1'
      // const token = 'ujunox'
      // const contract_addr = "juno1xrf2shh0lx93nzd4ug37zd6elj0gvzf6x2ct0xzf0jp3u28yvgssu4anms"

      // console.log({tx_here : "execiting"})

      return directTokenSwap({
        ...data,
        tokenA,
        // msgs,
        // swapDirection: 'tokenBtoTokenA',
        swapAddress,
        senderAddress: sender,
        slippage: 1,
        price,
        tokenAmount: Number(amount),
        client,
      })

      // return post(data)
    },
    {
      onMutate: () => {
        setTxStep(TxStep.Posting)
      },
      onError: (e: unknown) => {
        console.log({ tx_error: e })
        if (e instanceof UserDenied) {
          setError('User Denied')
        } else if (e instanceof CreateTxFailed) {
          setError(`Create Tx Failed: ${e.message}`)
        } else if (e instanceof TxFailed) {
          setError(`Tx Failed: ${e.message}`)
        } else if (e instanceof Timeout) {
          setError('Timeout')
        } else if (e instanceof TxUnspecifiedError) {
          setError(`Unspecified Error: ${e.message}`)
        } else {
          setError(
            `${e instanceof Error ? e.message : String(e)}`,
          )
        }

        setTxStep(TxStep.Failed)

        onError?.()
      },
      onSuccess: (data: any) => {
        setTxStep(TxStep.Broadcasting)
        setTxHash(data.transactionHash)
        onBroadcasting?.(data.transactionHash)
        toast({
          title: 'Swap Success.',
          description: `${tokenA.symbol} to ${tokenA.symbol} ${data.transactionHash}`,
          status: 'success',
          duration: 9000,
          position: "top-right",
          isClosable: true,
        })

      },
    },
  )

const { data: txInfo } = useQuery(
  ['txInfo', txHash],
  () => {
    if (txHash == null) {
      return
    }

    return client.queryClient.tx.getTx(txHash)
  },
  {
    enabled: txHash != null,
    retry: true,
  },
)

const reset = () => {
  setError(null)
  setTxHash(undefined)
  setTxStep(TxStep.Idle)
}

const submit = useCallback(async () => {
  if (msgs == null || msgs.length < 1) {
    return
  }
  // if (fee == null || msgs == null || msgs.length < 1) {
  //   return
  // }

  mutate({
    msgs,
    fee
  })
}, [msgs, fee, mutate, price])

useEffect(() => {
  if (txInfo != null && txHash != null) {
    if (txInfo.code) {
      setTxStep(TxStep.Failed)
      onError?.(txHash, txInfo)
    } else {
      setTxStep(TxStep.Success)
      onSuccess?.(txHash, txInfo)
    }
  }
}, [txInfo, onError, onSuccess, txHash])

useEffect(() => {
  if (error) {
    setError(null)
  }

  if (txStep != TxStep.Idle) {
    setTxStep(TxStep.Idle)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [debouncedMsgs])

return useMemo(() => {
  return {
    fee,
    submit,
    // fee: "auto",
    txStep,
    txInfo,
    txHash,
    error,
    reset,
  }
}, [txStep, txInfo, txHash, error, reset, fee])
  // }, [fee, txStep, txInfo, txHash, error, reset])
}

export default useTransaction
