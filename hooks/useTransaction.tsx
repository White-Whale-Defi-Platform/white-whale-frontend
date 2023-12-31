import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { useToast } from '@chakra-ui/react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { directTokenSwap } from 'components/Pages/Trade/Swap/hooks/directTokenSwap'
import { ChainId } from 'constants/index'
import { TxStep } from 'types/index'

import Finder from '../components/Finder'
import useDebounceValue from './useDebounceValue'

type Params = {
  enabled: boolean
  swapAddress: string
  swapAssets: any[]
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

// TODO make this useTx base version and remove the duplicate code
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
}: Params) => {
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
      if (!signingClient || !debouncedMsgs) {
        return
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
      } catch (err) {
        if (
          (/insufficient funds/u).test(err.toString()) ||
          (/Overflow: Cannot Sub with/u).test(err.toString())
        ) {
          console.error(err)
          setTxStep(TxStep.Idle)
          setError('Insufficient Funds')
          setButtonLabel('Insufficient Funds')
          throw new Error('Insufficient Funds')
        } else if ((/Max spread assertion/u).test(err.toString())) {
          console.error(err)
          setTxStep(TxStep.Idle)
          setError('Try increasing slippage')
          throw new Error('Try increasing slippage')
        } else {
          /*
           * Else if (/unreachable: query wasm contract failed: invalid request/i.test(error.toString())) {
           *   console.error(error)
           *   setTxStep(TxStep.Idle)
           *   setButtonLabel('Insuifficient liquidity')
           *   setError("Insuifficient liquidity")
           *   throw new Error('Insuifficient liquidity')
           * }
           */
          console.error(error)
          setTxStep(TxStep.Idle)
          setError('Failed to execute transaction.')
          throw Error('Failed to execute transaction.')
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
    onError: (e: unknown) => {
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
      setTxHash(data.transactionHash)
      onBroadcasting?.(data.transactionHash)
      const queryPath = `multipleTokenBalances/${swapAssets.
        map(({ symbol }) => symbol)?.
        join('+')}`
      await queryClient.invalidateQueries([queryPath])
      toast({
        title: 'Swap Success.',
        description: (
          <Finder txHash={data.transactionHash} chainId={await signingClient.getChainId()}>
            {' '}
              From: {tokenA.symbol} To: {tokenB.symbol}{' '}
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
    () => {
      if (!txHash) {
        return null
      }

      return signingClient.getTx(txHash)
    },
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [txStep, txInfo, txHash, error, reset, fee])
}
