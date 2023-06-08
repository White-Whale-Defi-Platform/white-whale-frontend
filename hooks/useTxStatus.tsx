import { useToast } from '@chakra-ui/react'
import Finder from 'components/Finder'
import useTxInfo from 'hooks/useTxInfo'
import { useEffect } from 'react'
import { useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import { txAtom } from 'state/atoms/tx'
import { TxStep } from 'types/common'
import { parseError } from 'util/parseError'

const useTx = ({ client, transcationType }) => {
  const [txState, setTxState] = useRecoilState(txAtom)
  const toast = useToast()
  const txInfo = useTxInfo({ txHash: txState.txHash, client })
  const queryClient = useQueryClient()

  useEffect(() => {
    if (txInfo != null && txState.txHash != null) {
      if (txInfo?.txResponse?.code) {
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

  const description = (hash: string) => (
    <Finder txHash={hash} chainId={client.client.chainId} />
  )

  const onError = (error: Error) => {
    const message = parseError(error)

    toast({
      title: `${transcationType} Failed.`,
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
      title: `${transcationType} Success.`,
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

export default useTx
