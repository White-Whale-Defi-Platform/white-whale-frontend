import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { useToast } from '@chakra-ui/react'
import Finder from 'components/Finder'
import useDebounceValue from 'hooks/useDebounceValue'

import { executeFlashloan } from './executeFlashloan'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'

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
  enabled: boolean
  signingClient: SigningCosmWasmClient
  senderAddress: string
  encodedMsgs: any | null
  contractAddress: string | undefined
  msgs: any | null
  onBroadcasting?: (txHash: string) => void
  onSuccess?: (txHash: string, txInfo?: any) => void
  onError?: (txHash?: string, txInfo?: any) => void
}

export const useTransaction = ({
  enabled,
  signingClient,
  senderAddress,
  encodedMsgs,
  msgs,
  contractAddress,
  onBroadcasting,
  onSuccess,
  onError,
}: Params) => {
  const debouncedMsgs = useDebounceValue(encodedMsgs, 200)
  const toast = useToast()

  const [txStep, setTxStep] = useState<TxStep>(TxStep.Idle)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)
  const [error, setError] = useState<unknown | null>(null)
  const [buttonLabel, setButtonLabel] = useState<unknown | null>(null)
  const queryClient = useQueryClient()

  const { data: fee, refetch } = useQuery<unknown, unknown, any | null>(
    ['fee', msgs, error],
    async () => {
      setTxStep(TxStep.Estimating)
      try {
        const response = await signingClient.simulate(
          senderAddress,
          debouncedMsgs,
          ''
        )
        if (buttonLabel) {
          setButtonLabel(null)
        }
        setTxStep(TxStep.Ready)
        return response
      } catch (err) {
        if (
          /insufficient funds/i.test(err.toString()) ||
          /Overflow: Cannot Sub with/i.test(err.toString())
        ) {
          console.error(err)
          setTxStep(TxStep.Idle)
          setError('Insufficient Funds')
          setButtonLabel('Insufficient Funds')
          throw new Error('Insufficient Funds')
        } else if (
          /Negative profits when attempting to flash-loan /i.test(
            err.toString()
          )
        ) {
          console.error(err)
          setTxStep(TxStep.Idle)
          setError('Negative profit')
          setButtonLabel('Negative profit')
          throw new Error('Negative profit')
        } else {
          console.error(err)
          setTxStep(TxStep.Idle)
          setError('Failed to execute transaction.')
          throw Error('Failed to execute transaction.')
        }
      }
    },
    {
      enabled:
        debouncedMsgs != null &&
        txStep == TxStep.Idle &&
        error == null &&
        Boolean(signingClient) &&
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
    }
  )

  const { mutate } = useMutation(
    () => {
      return executeFlashloan({
        msgs,
        signingClient,
        contractAddress,
        senderAddress,
      })
    },
    {
      onMutate: () => {
        setTxStep(TxStep.Posting)
      },
      onError: (e: unknown) => {
        let message = ''
        console.error(e?.toString())
        if (
          /insufficient funds/i.test(e?.toString()) ||
          /Overflow: Cannot Sub with/i.test(e?.toString())
        ) {
          setError('Insufficient Funds')
          message = 'Insufficient Funds'
        } else if (/Max spread assertion/i.test(e?.toString())) {
          setError('Try increasing slippage')
          message = 'Try increasing slippage'
        } else if (/Request rejected/i.test(e?.toString())) {
          setError('User Denied')
          message = 'User Denied'
        } else {
          setError('Failed to execute transaction.')
          message = 'Failed to execute transaction.'
        }

        toast({
          title: 'Flashloan Failed.',
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
        console.log({ data })
        setTxHash(data.transactionHash || data?.txHash)
        await queryClient.invalidateQueries([
          '@pool-liquidity',
          'multipleTokenBalances',
          'tokenBalance',
        ])
        onBroadcasting?.(data.transactionHash || data?.txHash)
        toast({
          title: 'Flashloan Success.',
          description: (
            <Finder
              txHash={data?.transactionHash || data?.txHash}
              chainId={await signingClient.getChainId()}
            >
              {' '}
            </Finder>
          ),
          status: 'success',
          duration: 9000,
          position: 'top-right',
          isClosable: true,
        })
      },
    }
  )

  const { data: txInfo } = useQuery(
    ['txInfo', txHash],
    () => {
      if (txHash == null) {
        return
      }

      return signingClient.getTx(txHash)
    },
    {
      enabled: txHash != null,
      retry: true,
    }
  )

  const submit = useCallback(async () => {
    if (msgs == null || msgs.length < 1) {
      return
    }
    mutate()
  }, [msgs, mutate])

  useEffect(() => {
    if (txInfo != null && txHash != null) {
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

    if (txStep != TxStep.Idle) {
      setTxStep(TxStep.Idle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgs])

  return useMemo(
    () => ({
      simulate: refetch,
      fee,
      buttonLabel,
      submit,
      txStep,
      txInfo,
      txHash,
      error,
    }),
    [txStep, txInfo, txHash, error, fee, buttonLabel, submit, refetch]
  )
}

export default useTransaction
