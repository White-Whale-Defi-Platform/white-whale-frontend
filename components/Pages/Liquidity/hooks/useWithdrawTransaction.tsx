import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { useToast } from '@chakra-ui/react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { coin } from '@cosmjs/stargate'
import Finder from 'components/Finder'
import useDebounceValue from 'hooks/useDebounceValue'
import { TxStep } from 'types/common'

type Params = {
  lpTokenAddress: string
  swapAddress: string
  enabled: boolean
  signingClient: SigningCosmWasmClient
  senderAddress: string
  msgs: any | null
  encodedMsgs: any | null
  amount: string
  onBroadcasting?: (txHash: string) => void
  onSuccess?: (txHash: string, txInfo?: any) => void
  onError?: (txHash?: string, txInfo?: any) => void
  isNative?: boolean
}

export const useWithdrawTransaction = ({
  lpTokenAddress,
  enabled,
  swapAddress,
  signingClient,
  senderAddress,
  msgs,
  encodedMsgs,
  amount,
  onBroadcasting,
  onSuccess,
  onError,
  isNative = false,
}: Params) => {
  const debouncedMsgs = useDebounceValue(encodedMsgs, 200)
  const toast = useToast()

  const [txStep, setTxStep] = useState<TxStep>(TxStep.Idle)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)
  const [error, setError] = useState<unknown | null>(null)
  const [buttonLabel, setButtonLabel] = useState<unknown | null>(null)
  const queryClient = useQueryClient()

  const { data: fee } = useQuery<unknown, unknown, any | null>(
    ['fee', amount, debouncedMsgs, error],
    async () => {
      setError(null)
      setTxStep(TxStep.Estimating)
      try {
        const response = await signingClient.simulate(
          senderAddress,
          debouncedMsgs,
          '',
        )
        if (buttonLabel) {
          setButtonLabel(null)
        }
        setTxStep(TxStep.Ready)
        return response
      } catch (e) {
        if (
          (/insufficient funds/i).test(e.toString()) ||
          (/Overflow: Cannot Sub with/i).test(e.toString())
        ) {
          console.error(e)
          setTxStep(TxStep.Idle)
          setError('Insufficient Funds')
          setButtonLabel('Insufficient Funds')
          throw new Error('Insufficient Funds')
        } else {
          console.error(e)
          setTxStep(TxStep.Idle)
          setError('Failed to execute transaction.')
          throw Error('Failed to execute transaction.')
        }
      }
    },
    {
      enabled:
        debouncedMsgs !== null &&
        txStep === TxStep.Idle &&
        error === null &&
        Boolean(signingClient) &&
        Number(amount) > 0 &&
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

  const { mutate } = useMutation((data: any) => (isNative
    ? signingClient.execute(
      senderAddress,
      swapAddress,
      { withdraw_liquidity: {} },
      'auto',
      null,
      [coin(amount, lpTokenAddress)],
    )
    : signingClient.signAndBroadcast(
      senderAddress,
      encodedMsgs,
      'auto',
      null,
    )),
  {
    onMutate: () => {
      setTxStep(TxStep.Posting)
    },
    onError: (e: unknown) => {
      let message = ''
      console.error(e?.toString())
      if (
        (/insufficient funds/i).test(e?.toString()) ||
          (/Overflow: Cannot Sub with/i).test(e?.toString())
      ) {
        setError('Insufficient Funds')
        message = 'Insufficient Funds'
      } else if ((/Max spread assertion/i).test(e?.toString())) {
        setError('Try increasing slippage')
        message = 'Try increasing slippage'
      } else if ((/Request rejected/i).test(e?.toString())) {
        setError('User Denied')
        message = 'User Denied'
      } else {
        setError('Failed to execute transaction.')
        message = 'Failed to execute transaction.'
      }

      toast({
        title: 'Withdraw Failed.',
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
      const chainId = await signingClient.getChainId()
      await queryClient.invalidateQueries({
        queryKey: [
          '@pool-liquidity',
          'multipleTokenBalances',
          'tokenBalance',
          'positions',
        ],
      })
      onBroadcasting?.(data.transactionHash || data?.txHash)
      toast({
        title: 'Withdraw Liquidity Success.',
        description: (
          <Finder
            txHash={data.transactionHash || data?.txHash}
            chainId={chainId.toString()}
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
    () => {
      if (txHash === null) {
        return null
      }

      return signingClient.getTx(txHash)
    },
    {
      enabled: txHash !== null,
      retry: true,
    },
  )

  const reset = () => {
    setError(null)
    setTxHash(undefined)
    setTxStep(TxStep.Idle)
  }

  const submit = useCallback(async () => {
    if (fee === null || msgs === null || msgs.length < 1) {
      return
    }

    mutate({
      msgs,
      fee,
    })
  }, [msgs, fee, mutate])

  useEffect(() => {
    if (txInfo !== null && txHash !== null) {
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
