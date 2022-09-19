import { useToast } from '@chakra-ui/react'
import Finder from 'components/Finder'
import useDebounceValue from 'hooks/useDebounceValue'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { executeAddLiquidity } from 'services/liquidity'

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
  swapAddress: string;
  swapAssets: any[];
  price?: number;
  client: any;
  senderAddress: string;
  poolId: string;
  msgs: any | null;
  encodedMsgs: any | null;
  amount?: string;
  gasAdjustment?: number;
  estimateEnabled?: boolean;
  tokenAAmount?: number,
  tokenBAmount?: number,
  onBroadcasting?: (txHash: string) => void;
  onSuccess?: (txHash: string, txInfo?: any) => void;
  onError?: (txHash?: string, txInfo?: any) => void;
}

export const useTransaction = ({
  poolId,
  enabled,
  swapAddress,
  swapAssets,
  client,
  senderAddress,
  msgs,
  encodedMsgs,
  amount,
  price,
  tokenAAmount,
  tokenBAmount,
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
  const queryClient = useQueryClient()

  const { data: fee } = useQuery<unknown, unknown, any | null>(
    ['fee', amount, debouncedMsgs, error], async () => {
      setError(null)
      setTxStep(TxStep.Estimating)
      try {
        // console.log({senderAddress, debouncedMsgs, msg : JSON.parse(String.fromCharCode.apply(null, debouncedMsgs?.[0]?.value?.msg))})
        const response = await client.simulate(senderAddress, debouncedMsgs, '')
        if (!!buttonLabel) setButtonLabel(null)
        setTxStep(TxStep.Ready)
        return response
      } catch (error) {
        if (/insufficient funds/i.test(error.toString()) || /Overflow: Cannot Sub with/i.test(error.toString())) {
          console.error(error)
          setTxStep(TxStep.Idle)
          setError("Insufficient Funds")
          setButtonLabel('Insufficient Funds')
          throw new Error('Insufficient Funds')
        }
        else if (/account sequence mismatch/i.test(error?.toString()) ) {
          setError("You have pending transaction")
          setButtonLabel('You have pending transaction')
          throw new Error('You have pending transaction')
        }
        else if (/Max spread assertion/i.test(error.toString())) {
          console.error(error)
          setTxStep(TxStep.Idle)
          setError("Try increasing slippage")
          throw new Error('Try increasing slippage')
        } else {
          console.error({ error })
          setTxStep(TxStep.Idle)
          setError(error?.message)
          throw Error(error?.message)
          // setTxStep(TxStep.Idle)
          // setError("Failed to execute transaction.")
          // throw Error("Failed to execute transaction.")
        }
      }
    },
    {
      enabled: debouncedMsgs != null && txStep == TxStep.Idle && error == null && enabled && !!swapAddress && (!!tokenAAmount || !!tokenBAmount),
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

      return executeAddLiquidity({
        tokenA,
        tokenB,
        tokenAAmount: Number((tokenAAmount)),
        maxTokenBAmount: Number(tokenBAmount),
        client,
        swapAddress,
        senderAddress,
        msgs
      })
    },
    {
      onMutate: () => {
        setTxStep(TxStep.Posting)
      },
      onError: (e) => {
        let message:any = ''
        console.error(e?.toString())
        setTxStep(TxStep.Failed)

        if (/insufficient funds/i.test(e?.toString()) || /Overflow: Cannot Sub with/i.test(e?.toString())){
          setError("Insufficient Funds")
          message = "Insufficient Funds"
        }
        else if (/Max spread assertion/i.test(e?.toString())){
          setError("Try increasing slippage")
          message = "Try increasing slippage"
        }
        else if (/Request rejected/i.test(e?.toString())) {
          setError("User Denied")
          message = "User Denied"
        }
        else if (/account sequence mismatch/i.test(e?.toString())) {
          setError("You have pending transaction")
          message = "You have pending transaction"
        }
        else if (/out of gas/i.test(e?.toString())) {
          setError("Out of gas, try increasing gas limit on wallet.")
          message = "Out of gas, try increasing gas limit on wallet."
        }
        else if (/was submitted but was not yet found on the chain/i.test(e?.toString())) {
          setError(e?.toString())
          message = <Finder txHash={txInfo?.txHash} chainId={client?.chainId} > </Finder>
        }
        else{
          setError("Failed to execute transaction.")
          message = "Failed to execute transaction."
        }

        toast({
          title: 'Add Liquidity Failed.',
          description: message,
          status: 'error',
          duration: 9000,
          position: "top-right",
          isClosable: true,
        })



        onError?.()
      },
      onSuccess: (data: any) => {
        setTxStep(TxStep.Broadcasting)
        setTxHash(data.transactionHash)
        onBroadcasting?.(data.transactionHash)
        const queryPath = `@pool-liquidity/${poolId}/${senderAddress}`
        queryClient.invalidateQueries([queryPath])
        toast({
          title: 'Add Liquidity Success.',
          description: <Finder txHash={data.transactionHash} chainId={client.chainId} > </Finder>,
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
      return client.getTx(txHash)
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
