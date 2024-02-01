import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { useToast } from '@chakra-ui/react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate';
import Finder from 'components/Finder'
import { ChainId } from 'constants/index'
import useDebounceValue from 'hooks/useDebounceValue'
import { TxStep } from 'types/index'

import { executeFlashloan } from './executeFlashloan'

type Params = {
  enabled: boolean
  signingClient: SigningCosmWasmClient
  senderAddress: string
  encodedMsgs: any | null
  contractAddress: string | undefined
  msgs: any | null
  injectiveSigningClient?: InjectiveSigningStargateClient
  onBroadcasting?: (txHash: string) => void
  onSuccess?: (txHash: string, txInfo?: any) => void
  onError?: (txHash?: string, txInfo?: any) => void
}

export const useTransaction = ({
  enabled,
  signingClient,
  senderAddress,
  encodedMsgs,
  contractAddress,
  msgs,
  injectiveSigningClient,
  onBroadcasting,
  onSuccess,
  onError,
}: Params) => {
  const debouncedMsgs = useDebounceValue(encodedMsgs, 200)
  const toast = useToast()

  const [txStep, setTxStep] = useState<TxStep>(TxStep.Idle)
  const [txHash, setTxHash] = useState<string>(null)
  const [error, setError] = useState<unknown | null>(null)
  const [buttonLabel, setButtonLabel] = useState<unknown | null>(null)
  const queryClient = useQueryClient()

  const { data: fee, refetch } = useQuery<unknown, unknown, any | null>(
    ['fee', msgs, error],
    async () => {
      setTxStep(TxStep.Estimating)
      if (!signingClient) {
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
        } else if (
          (/Negative profits when attempting to flash-loan /u).test(err.toString())
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
      Boolean(debouncedMsgs) &&
        txStep === TxStep.Idle &&
        !error &&
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
    },
  )

  const { mutate } = useMutation(() => executeFlashloan({
    msgs,
    signingClient,
    contractAddress,
    senderAddress,
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
  })

  const { data: txInfo } = useQuery(
    ['txInfo', txHash],
    () => signingClient.getTx(txHash),
    {
      enabled: Boolean(txHash),
      retry: true,
    },
  )

  const submit = useCallback(() => {
    if (!msgs || msgs.length < 1) {
      return
    }
    mutate()
  }, [msgs, mutate])

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
  }, [msgs])

  return useMemo(() => ({
    simulate: refetch,
    fee,
    buttonLabel,
    submit,
    txStep,
    txInfo,
    txHash,
    error,
  }),
  [txStep, txInfo, txHash, error, fee, buttonLabel, submit, refetch])
}

export default useTransaction
