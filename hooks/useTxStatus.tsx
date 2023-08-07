import { useEffect } from 'react'
import { useQueryClient } from 'react-query'

import { useToast } from '@chakra-ui/react'
import Finder from 'components/Finder'
import useTxInfo from 'hooks/useTxInfo'
import { useRecoilState } from 'recoil'
import { txAtom } from 'state/atoms/tx'
import { TxStep } from 'types/common'
import { parseError } from 'util/parseError'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'

type Props = {
  signingClient: SigningCosmWasmClient
  transactionType: string
}
const useTxStatus = ({ signingClient, transactionType }: Props) => {
  const [txState, setTxState] = useRecoilState(txAtom)
  const toast = useToast()
  const txInfo = useTxInfo({ txHash: txState.txHash, signingClient })
  const queryClient = useQueryClient()

  useEffect(() => {
    if (txInfo != null && txState.txHash != null) {
      if (txInfo?.code) {
        setTxState({
          ...txState,
          txStep: TxStep.Failed,
        })
      } else {
        setTxState({
          ...txState,
          txStep: TxStep.Success,
        })
      }
    }
  }, [txInfo, txState.txHash])

  const description = async (hash: string) => (
    <Finder txHash={hash} chainId={await signingClient.getChainId()}>
      {' '}
    </Finder>
  )

  const onError = (error: Error) => {
    const message = parseError(error)

    toast({
      title: `${transactionType} Failed.`,
      description: message,
      status: 'error',
      duration: 9000,
      position: 'top-right',
      isClosable: true,
    })

    setTxState({
      ...txState,
      txStep: TxStep.Failed,
    })
  }

  const onMutate = () => {
    setTxState({
      ...txState,
      txStep: TxStep.Posting,
    })
  }

  const reset = () => {
    setTxState({
      txStep: TxStep.Idle,
      txHash: undefined,
      error: null,
      buttonLabel: null,
    })
  }

  const onSuccess = async (data: any) => {
    setTxState({
      ...txState,
      txStep: TxStep.Broadcasting,
      txHash: data.transactionHash,
    })

    toast({
      title: `${transactionType} Success.`,
      description: description(data.transactionHash),
      status: 'success',
      duration: 9000,
      position: 'top-right',
      isClosable: true,
    })

    queryClient.invalidateQueries({ queryKey: '@pool-liquidity' })
    queryClient.invalidateQueries({ queryKey: ['multipleTokenBalances'] })
    queryClient.invalidateQueries({ queryKey: ['tokenBalance'] })
    queryClient.invalidateQueries({ queryKey: ['positions'] })
    queryClient.invalidateQueries({ queryKey: ['rewards'] })
    queryClient.refetchQueries()
  }

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
