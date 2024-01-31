import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { useToast } from '@chakra-ui/react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate';
import Finder from 'components/Finder'
import { directTokenSwap } from 'components/Pages/Trade/Swap/hooks/directTokenSwap'
import { ChainId } from 'constants/index'
import useDebounceValue from 'hooks/useDebounceValue'
import { TxStep } from 'types/index'

type Params = {
  enabled: boolean
  swapAddress: string
  swapAssets: any[]
  price: number
  signingClient: SigningCosmWasmClient
  senderAddress: string
  msgs: any | null
  encodedMsgs: any | null
  amount: string
  gasAdjustment?: number
  estimateEnabled?: boolean
  injectiveSigningClient?: InjectiveSigningStargateClient
  onBroadcasting?: (txHash: string) => void
  onSuccess?: (txHash: string, txInfo?: any) => void
  onError?: (txHash?: string, txInfo?: any) => void
}

export const useTransaction = ({
  enabled,
  swapAddress,
  swapAssets,
  signingClient,
  injectiveSigningClient,
  senderAddress,
  msgs,
  encodedMsgs,
  amount,
  onBroadcasting,
  onSuccess,
  onError,
}: Params): any => {
  const debouncedMsgs = useDebounceValue(encodedMsgs, 200)
  const [tokenA, tokenB] = swapAssets
  const toast = useToast()
  const queryClient = useQueryClient()

  const [txStep, setTxStep] = useState<TxStep>(TxStep.Idle)
  const [txHash, setTxHash] = useState<string>(null)
  const [error, setError] = useState<unknown | null>(null)
  const [buttonLabel, setButtonLabel] = useState<unknown | null>(null)

  const { data: fee } = useQuery<unknown, unknown, any | null>(
    ['fee', amount, debouncedMsgs, error],
    async () => {
      setError(null)
      setTxStep(TxStep.Estimating)
      if (!signingClient) {
        return null
      }
      try {
        const isInjective = await signingClient.getChainId() === ChainId.injective
        const response = isInjective && injectiveSigningClient ? await injectiveSigningClient?.simulate(
          senderAddress,
          debouncedMsgs,
          '',
        ) : await signingClient?.simulate(
          senderAddress,
          debouncedMsgs,
          '',
        )
        if (buttonLabel) {
          setButtonLabel(null)
        }
        setTxStep(TxStep.Ready)
        return response
      } catch (error) {
        if (
          (/insufficient funds/u).test(error.toString()) ||
          (/Overflow: Cannot Sub with/u).test(error.toString())
        ) {
          console.error(error)
          setTxStep(TxStep.Idle)
          setError('Insufficient Funds')
          setButtonLabel('Insufficient Funds')
          throw new Error('Insufficient Funds')
        } else if ((/Max spread assertion/u).test(error.toString())) {
          setTxStep(TxStep.Idle)
          setError('Try increasing slippage')
          setButtonLabel('Try increasing slippage or a smaller amount')
          throw new Error('Try increasing slippage')
        } else if ((/Spread limit exceeded/u).test(error.toString())) {
          setTxStep(TxStep.Idle)
          setButtonLabel('Try increasing slippage or a smaller amount')
          setError('Try increasing slippage or a smaller amount')
          throw new Error('Try increasing slippage')
        } else {
          console.error(error)
          setTxStep(TxStep.Idle)
          setError('Failed to simulate transaction.')
          /*
           * Toast({
           *   title: 'Simulation Failed.',
           *   description: "Failed to simulate transaction.",
           *   status: 'error',
           *   duration: 9000,
           *   position: "top-right",
           *   isClosable: true,
           * })
           */
          throw Error('Failed to simulate transaction.')
        }
      }
    },
    {
      enabled:
        Boolean(debouncedMsgs) &&
        txStep === TxStep.Idle &&
        !error &&
        enabled,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 0,
      onSuccess: () => {
        setTxStep(TxStep.Ready)
      },
      onError: () => {
        setTxStep(TxStep.Idle)
      },
    },
  )
  const { mutate } = useMutation(() => directTokenSwap({
    tokenA,
    swapAddress,
    senderAddress,
    msgs,
    tokenAmount: amount,
    signingClient,
    injectiveSigningClient,
  }),
  {
    onMutate: () => {
      setTxStep(TxStep.Posting)
    },
    onError: (e: any) => {
      let message = ''
      console.error(e?.toString())
      if (
        (/insufficient funds/u).test(e?.toString()) ||
          (/Overflow: Cannot Sub with/u).test(e?.toString())
      ) {
        setError('Insufficient Funds')
        message = 'Insufficient Funds'
      } else if ((/Max spread assertion/u).test(e?.toString())) {
        setError('Try increasing slippage')
        message = 'Try increasing slippage'
      } else if ((/Request rejected/u).test(e?.toString())) {
        setError('User Denied')
        message = 'User Denied'
      } else {
        setError('Failed to execute transaction.')
        message = 'Failed to execute transaction.'
      }
      toast({
        title: 'Swap Failed.',
        description: message,
        status: 'error',
        duration: 9000,
        position: 'top-right',
        isClosable: true,
      })

      setTxStep(TxStep.Failed)
      onError?.()
    },
    onSuccess: async (data: any) => {
      setTxStep(TxStep.Broadcasting)
      setTxHash(data.transactionHash || data.txHash)
      onBroadcasting?.(data.transactionHash)
      await queryClient.invalidateQueries([
        'multipleTokenBalances',
        'tokenBalance',
      ])
      toast({
        title: 'Swap Success.',
        description: (
          <Finder
            txHash={data.transactionHash || data.txHash}
            chainId={await signingClient?.getChainId()}
          >
            {`${tokenA.symbol} -> ${tokenB.symbol}`}
          </Finder>
        ),
        status: 'success',
        duration: 9000,
        position: 'top-right',
        isClosable: true,
      })
    },
  })

  const { data: txInfo } = useQuery(
    ['txInfo', txHash],
    () => signingClient.getTx(txHash),
    {
      enabled: Boolean(txHash),
      retry: true,
    },
  )

  const reset = () => {
    setError(null)
    setTxHash(null)
    setTxStep(TxStep.Idle)
  }

  const submit = useCallback(() => {
    if (!(!fee || !msgs || msgs.length < 1)) {
      mutate()
    }
  }, [msgs, fee, mutate])

  useEffect(() => {
    // Dont change to !== breaking
    if (txInfo && txHash) {
      if (txInfo?.code) {
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

    if (txStep !== TxStep.Idle) {
      setTxStep(TxStep.Idle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMsgs])
  return useMemo(() => ({
    fee,
    buttonLabel,
    submit,
    txStep,
    txInfo,
    txHash,
    error,
    reset,
  }),
  [txStep, txInfo, txHash, error, reset, fee])
}

export default useTransaction
