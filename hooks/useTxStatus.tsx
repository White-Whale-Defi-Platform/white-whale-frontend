import { useEffect } from 'react'
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

type Props = {
  signingClient: SigningCosmWasmClient | InjectiveSigningStargateClient
  transactionType: string
}
const useTxStatus = ({ signingClient, transactionType }: Props) => {
  const [txState, setTxState] = useRecoilState(txRecoilState)
  const toast = useToast()
  const txInfo = useTxInfo({ txHash: txState.txHash,
    signingClient })
  const queryClient = useQueryClient()

  useEffect(() => {
    if (txInfo && txState.txHash) {
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
      txHash: null,
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

    await queryClient.invalidateQueries({
      queryKey: [
        '@pool-liquidity',
        'multipleTokenBalances',
        'tokenBalance',
        'positions',
        'rewards',
      ],
    })

    await queryClient.refetchQueries()
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
