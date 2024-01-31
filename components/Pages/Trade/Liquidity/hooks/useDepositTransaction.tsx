import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { useToast } from '@chakra-ui/react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate';
import Finder from 'components/Finder'
import { ChainId } from 'constants/index'
import useDebounceValue from 'hooks/useDebounceValue'
import { executeAddLiquidity } from 'services/liquidity/index'
import { TxStep } from 'types/common'

type Params = {
  enabled: boolean
  swapAddress: string
  swapAssets?: any[]
  price?: number
  signingClient: SigningCosmWasmClient
  senderAddress: string
  msgs: any | null
  encodedMsgs: any | null
  gasAdjustment?: number
  estimateEnabled?: boolean
  tokenAAmount?: string
  tokenBAmount?: string
  injectiveSigningClient?: InjectiveSigningStargateClient
  onBroadcasting?: (txHash: string) => void
  onSuccess?: (txHash: string, txInfo?: any) => void
  onError?: (txHash?: string, txInfo?: any) => void
}

export const useTransaction: any = ({
  enabled,
  swapAddress,
  signingClient,
  injectiveSigningClient,
  senderAddress,
  msgs,
  encodedMsgs,
  tokenAAmount,
  tokenBAmount,
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

  const { data: fee } = useQuery<unknown, unknown, any | null>(
    ['fee', tokenAAmount, tokenBAmount, debouncedMsgs, error],
    async () => {
      setError(null)
      setTxStep(TxStep.Estimating)
      if (!signingClient || !debouncedMsgs || debouncedMsgs?.length == 0) {
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
        } else if ((/account sequence mismatch/u).test(error?.toString())) {
          setError('You have pending transaction')
          setButtonLabel('You have pending transaction')
          throw new Error('You have pending transaction')
        } else if ((/Max spread assertion/u).test(error.toString())) {
          console.error(error)
          setTxStep(TxStep.Idle)
          setError('Try increasing slippage')
          throw new Error('Try increasing slippage')
        } else if ((/Slippage tolerance exceeded/u).test(error.toString())) {
          console.error(error)
          setTxStep(TxStep.Idle)
          setError('Slippage too high')
          throw new Error('Retry again later')
        } else {
          setTxStep(TxStep.Idle)
          setError(error?.message)
          throw Error(error?.message)
          /*
           * SetTxStep(TxStep.Idle)
           * setError("Failed to execute transaction.")
           * throw Error("Failed to execute transaction.")
           */
        }
      }
    },
    {
      enabled:
      Boolean(debouncedMsgs) &&
        txStep === TxStep.Idle &&
        !error &&
        Boolean(signingClient) &&
        Boolean(senderAddress) &&
        enabled &&
        Boolean(swapAddress) &&
        Number(tokenAAmount) > 0 &&
        Number(tokenBAmount) > 0,

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
  const { mutate } = useMutation(() => executeAddLiquidity({
    signingClient,
    injectiveSigningClient,
    swapAddress,
    senderAddress,
    msgs: debouncedMsgs,
  }),
  {
    onMutate: () => {
      setTxStep(TxStep.Posting)
    },
    onError: async (e) => {
      let message: any = ''
      console.error(e?.toString())
      setTxStep(TxStep.Failed)

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
      } else if ((/account sequence mismatch/u).test(e?.toString())) {
        setError('You have pending transaction')
        message = 'You have pending transaction'
      } else if ((/out of gas/u).test(e?.toString())) {
        setError('Out of gas, try increasing gas limit on wallet.')
        message = 'Out of gas, try increasing gas limit on wallet.'
      } else if (
        (/was submitted but was not yet found on the chain/u).test(e?.toString())
      ) {
        setError(e?.toString())
        message = (
          <Finder
            txHash={txInfo?.hash}
            chainId={await signingClient.getChainId()}
          >
            {' '}
          </Finder>
        )
      } else {
        setError('Failed to execute transaction.')
        message = 'Failed to execute transaction.'
      }
      toast({
        title: 'Add Liquidity Failed.',
        description: message,
        status: 'error',
        duration: 9000,
        position: 'top-right',
        isClosable: true,
      })
      onError?.()
    },
    onSuccess: async (data: any) => {
      setTxStep(TxStep.Broadcasting)
      setTxHash(data.transactionHash || data?.txHash)
      onBroadcasting?.(data.transactionHash || data?.txHash)

      await queryClient.invalidateQueries({ queryKey: ['@pool-liquidity', 'multipleTokenBalances', 'tokenBalance', 'positions'] })

      toast({
        title: 'Add Liquidity Success.',
        description: (
          <Finder
            txHash={data.transactionHash || data?.txHash}
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
  [fee, buttonLabel, submit, txStep, txInfo, txHash, error])
}

export default useTransaction
