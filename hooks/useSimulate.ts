import { useQuery } from 'react-query'

import { EncodeObject } from '@cosmjs/proto-signing'
import { useRecoilState } from 'recoil'
import { txAtom } from 'state/atoms/tx'
import { TxStep } from 'types/common'
import { parseError } from 'util/parseError'
import { Wallet } from 'util/wallet-adapters'

type Simulate = {
  msgs: EncodeObject[]
  client: Wallet | undefined
  address: string | undefined
  connected: boolean
  amount: string
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
}

const useSimulate = ({
  msgs,
  client,
  address,
  connected,
  amount,
  onError,
  onSuccess,
}: Simulate) => {
  const [txState, setTxState] = useRecoilState(txAtom)

  const simulate = useQuery({
    queryKey: ['simulate', msgs, amount],
    queryFn: () => {
      if (!connected || Number(amount) <= 0 || !address || !client || !msgs) {
        return
      }

      setTxState({
        txStep: TxStep.Estimating,
        txHash: undefined,
        error: null,
        buttonLabel: null,
      })

      return client?.simulate(address, msgs!, undefined)
    },
    onSuccess: (data) => {
      onSuccess?.(data)
      setTxState({
        ...txState,
        txStep: TxStep.Ready,
      })
    },
    onError: (error: Error) => {
      const message = parseError(error)
      setTxState({
        txStep: TxStep.Idle,
        txHash: undefined,
        error: message,
        buttonLabel: message,
      })
      onError?.(error)
    },
    enabled: msgs?.length > 0 && !!connected && Number(amount) > 0,
    retry: false,
  })

  return {
    ...simulate,
    ...txState,
  }
}

export default useSimulate
