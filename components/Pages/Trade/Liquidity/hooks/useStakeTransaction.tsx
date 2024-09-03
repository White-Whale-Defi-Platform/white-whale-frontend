import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { useToast } from '@chakra-ui/react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import Finder from 'components/Finder'
import { ADV_MEMO } from 'constants/index'
import useDebounceValue from 'hooks/useDebounceValue'
import { createGasFee } from 'services/treasuryService'
import { TxStep } from 'types/common'

interface StakeTransactionParams {
  enabled: boolean
  signingClient: SigningCosmWasmClient
  senderAddress: string
  msgs: any[] | null
  onBroadcasting?: (txHash: string) => void
  onSuccess?: (txHash: string, txInfo?: any) => void
  onError?: (txHash?: string, txInfo?: any) => void
  isNative?: boolean
  injectiveSigningClient?: InjectiveSigningStargateClient
}

export const useStakeTransaction = ({
  enabled,
  signingClient,
  senderAddress,
  msgs,
  onBroadcasting,
  onSuccess,
  onError,
}: StakeTransactionParams) => {
  const debouncedMsgs = useDebounceValue(msgs, 200)
  const toast = useToast()
  const queryClient = useQueryClient()

  const [txState, setTxState] = useState({
    step: TxStep.Idle,
    hash: null as string | null,
    error: null as unknown | null,
    buttonLabel: null as string | null,
  })

  const handleError = useCallback((e: unknown, customMessage?: string) => {
    console.error(e?.toString())
    let errorMessage = 'Failed to execute transaction.'

    if (txState.step != TxStep.Posting) {
      return
    }

    if ((/insufficient funds/u).test(e?.toString()) || (/Overflow: Cannot Sub with/u).test(e?.toString())) {
      errorMessage = 'Insufficient Funds'
    } else if ((/Max spread assertion/u).test(e?.toString())) {
      errorMessage = 'Try increasing slippage'
    } else if ((/Request rejected/u).test(e?.toString())) {
      errorMessage = 'User Denied'
    }

    setTxState((prev) => ({ ...prev,
      step: TxStep.Failed,
      error: errorMessage,
      buttonLabel: errorMessage }))

    toast({
      title: 'Transaction Failed',
      description: customMessage || errorMessage,
      status: 'error',
      duration: 9000,
      position: 'top-right',
      isClosable: true,
    })

    onError?.()
  }, [toast, onError])

  const { data: fee } = useQuery<unknown, unknown, any | null>(
    ['fee', debouncedMsgs, txState.error, signingClient],
    async () => {
      setTxState((prev) => ({ ...prev,
        error: null,
        step: TxStep.Estimating }))
      if (!signingClient || !debouncedMsgs || debouncedMsgs.length === 0) {
        return null
      }

      try {
        const response = await signingClient.simulate(
          senderAddress, debouncedMsgs, '',
        )
        setTxState((prev) => ({ ...prev,
          step: TxStep.Ready,
          buttonLabel: null }))
        return response
      } catch (e) {
        handleError(e)
        throw e
      }
    },
    {
      enabled: Boolean(debouncedMsgs) && txState.step === TxStep.Idle && !txState.error && Boolean(signingClient) && enabled,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 0,
    },
  )

  const { mutate } = useMutation(async () => {
    const gasFee = await createGasFee(
      signingClient, senderAddress, debouncedMsgs,
    )
    return signingClient.signAndBroadcast(
      senderAddress, debouncedMsgs, gasFee, ADV_MEMO,
    )
  },
  {
    onMutate: () => setTxState((prev) => ({ ...prev,
      step: TxStep.Posting })),
    onError: (e: unknown) => handleError(e),
    onSuccess: async (data: any) => {
      setTxState((prev) => ({ ...prev,
        step: TxStep.Broadcasting,
        hash: data?.transactionHash || data?.txHash }))
      const chainId = await signingClient.getChainId()
      await queryClient.invalidateQueries(['@pool-liquidity', 'multipleTokenBalances', 'tokenBalance', 'positions', 'alliance-positions', 'signingClient'])
      onBroadcasting?.(data?.transactionHash || data?.txHash)

      toast({
        title: 'Staking Success',
        description: <Finder txHash={data?.transactionHash || data?.txHash} chainId={chainId.toString()} />,
        status: 'success',
        duration: 9000,
        position: 'top-right',
        isClosable: true,
      })
    },
  })

  const { data: txInfo } = useQuery(
    ['txInfo', txState.hash],
    () => signingClient?.getTx(txState.hash!),
    {
      enabled: Boolean(txState.hash) && Boolean(signingClient),
      retry: true,
    },
  )

  useEffect(() => {
    if (txInfo && txState.hash) {
      if (txInfo?.code) {
        setTxState((prev) => ({ ...prev,
          step: TxStep.Failed }))
        onError?.(txState.hash, txInfo)
      } else {
        setTxState((prev) => ({ ...prev,
          step: TxStep.Success }))
        onSuccess?.(txState.hash, txInfo)
      }
    }
  }, [txInfo, onError, onSuccess, txState.hash])

  useEffect(() => {
    if (txState.error || txState.step !== TxStep.Idle) {
      setTxState((prev) => ({ ...prev,
        error: null,
        step: TxStep.Idle }))
    }
  }, [debouncedMsgs])

  const submit = useCallback(() => {
    if (fee && msgs && msgs.length > 0) {
      mutate()
    }
  }, [msgs, fee, mutate])

  const reset = useCallback(() => {
    setTxState({
      step: TxStep.Idle,
      hash: null,
      error: null,
      buttonLabel: null,
    })
  }, [])

  return useMemo(() => ({
    fee,
    buttonLabel: txState.buttonLabel,
    submit,
    txStep: txState.step,
    txInfo,
    txHash: txState.hash,
    error: txState.error,
    reset,
  }), [fee, txState, submit, txInfo, reset])
}
