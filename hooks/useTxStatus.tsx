import { useEffect, useCallback } from 'react'
import { useQueryClient } from 'react-query'
import { useToast } from '@chakra-ui/react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import Finder from 'components/Finder'
import useTxInfo from 'hooks/useTxInfo'
import { useRecoilState } from 'recoil'
import { txRecoilState } from 'state/txRecoilState'
import { TxStep } from 'types/common'
import { parseError } from 'util/parseError'

type SigningClient = SigningCosmWasmClient | InjectiveSigningStargateClient

interface UseTxStatusProps {
  signingClient: SigningClient
  transactionType: string
}

export interface TxResult {
  transactionHash: string
}

const useTxStatus = ({ signingClient, transactionType }: UseTxStatusProps) => {
  const [txState, setTxState] = useRecoilState(txRecoilState)
  const toast = useToast()
  const queryClient = useQueryClient()

  const txInfo = useTxInfo({
    txHash: txState.txHash,
    signingClient
  })

  useEffect(() => {
    if (txInfo && txState.txHash) {
      setTxState(prevState => ({
        ...prevState,
        txStep: txInfo.code ? TxStep.Failed : TxStep.Success,
      }))
    }
  }, [txInfo, txState.txHash, setTxState])

  const description = useCallback(async (hash: string) => (
    <Finder txHash={hash} chainId={await signingClient.getChainId()}>
      {' '}
    </Finder>
  ), [signingClient])

  const onError = useCallback((error: Error) => {
    const message = parseError(error)

    toast({
      title: `${transactionType} Failed`,
      description: message,
      status: 'error',
      duration: 9000,
      position: 'top-right',
      isClosable: true,
    })

    setTxState(prevState => ({
      ...prevState,
      txStep: TxStep.Failed,
    }))
  }, [transactionType, toast, setTxState])

  const onMutate = useCallback(() => {
    setTxState(prevState => ({
      ...prevState,
      txStep: TxStep.Posting,
    }))
  }, [setTxState])

  const reset = useCallback(() => {
    setTxState({
      txStep: TxStep.Idle,
      txHash: null,
      error: null,
      buttonLabel: null,
    })
  }, [setTxState])

  const onSuccess = useCallback(async (data: TxResult) => {
    setTxState(prevState => ({
      ...prevState,
      txStep: TxStep.Broadcasting,
      txHash: data.transactionHash,
    }))

    toast({
      title: `${transactionType} Success`,
      description: await description(data.transactionHash),
      status: 'success',
      duration: 9000,
      position: 'top-right',
      isClosable: true,
    })

    await queryClient.invalidateQueries({
      queryKey: [
        '@pool-liquidity',
        'multipleTokenBalances',
        'tokenBalance',
        'positions',
        'rewards',
        'signingClient',
      ],
    })
  }, [transactionType, description, toast, queryClient, setTxState])

  return {
    ...txState,
    onMutate,
    onError,
    onSuccess,
    txInfo,
    reset,
  }
}

export default useTxStatus
