import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CreateTxFailed, Timeout, TxFailed,
  TxUnspecifiedError, UserDenied
} from '@terra-money/wallet-provider'
import { useMutation, useQuery } from 'react-query'
import { directTokenSwap } from '../services/swap'
import useDebounceValue from './useDebounceValue'
import { useToast } from '@chakra-ui/react'
import Finder from '../components/Finder'

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
  enabled: boolean;
  swapAddress:string;
  swapAssets: any[];
  price: number;
  client: any;
  senderAddress: string;
  msgs: any | null;
  encodedMsgs: any | null;
  amount: string;
  gasAdjustment?: number;
  estimateEnabled?: boolean;
  onBroadcasting?: (txHash: string) => void;
  onSuccess?: (txHash: string, txInfo?: any) => void;
  onError?: (txHash?: string, txInfo?: any) => void;
}

export const useTransaction = ({
  enabled,
  swapAddress,
  swapAssets,
  client,
  senderAddress,
  msgs,
  encodedMsgs,
  amount,
  price,
  onBroadcasting,
  onSuccess,
  onError,
}: Params) => {
  const debouncedMsgs = useDebounceValue(encodedMsgs, 200)
  const [tokenA, tokenB] = swapAssets
  const toast = useToast()

  const [txStep, setTxStep] = useState<TxStep>(TxStep.Idle)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)
  const [error, setError] = useState<unknown | null>(null)
  const [buttonLabel, setButtonLabel] = useState<unknown | null>(null)

  const { data: fee } = useQuery<unknown, unknown, any | null>(
    ['fee', amount, debouncedMsgs, error], async () => {
      setError(null)
      setTxStep(TxStep.Estimating)
      try {
        const response = await client.simulate(senderAddress, debouncedMsgs, '')
        if(!!buttonLabel)  setButtonLabel(null)
        setTxStep(TxStep.Ready)
        return response
      } catch (error) {
        if (/insufficient funds/i.test(error.toString()) || /Overflow: Cannot Sub with/i.test(error.toString())) {
          console.error(error)
          setTxStep(TxStep.Idle)
          setError("Insufficent funds")
          setButtonLabel('Insufficent funds')
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
      enabled: debouncedMsgs != null && txStep == TxStep.Idle && error == null && enabled,
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

  

  const { mutate } = useMutation(
    (data: any) => {
      return directTokenSwap({
        tokenA,
        swapAddress,
        senderAddress,
        msgs,
        tokenAmount: Number(amount),
        client,
      })
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
          description:  <Finder from={tokenA.symbol}  to={tokenB.symbol} txHash={data.transactionHash} chainId={client.chainId} /> ,
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
  if (fee == null || msgs == null || msgs.length < 1) {
    return
  }

  mutate({
    msgs,
    fee
  })
}, [msgs, fee, mutate, price])

useEffect(() => {
  if (txInfo != null && txHash != null) {
    if (txInfo?.txResponse?.code) {
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
    buttonLabel,
    submit,
    txStep,
    txInfo,
    txHash,
    error,
    reset,
  }
}, [txStep, txInfo, txHash, error, reset, fee])
}

export default useTransaction
