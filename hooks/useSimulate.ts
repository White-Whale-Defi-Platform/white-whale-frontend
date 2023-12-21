import { useQuery } from 'react-query'

import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { EncodeObject } from '@cosmjs/proto-signing'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { useRecoilState } from 'recoil'
import { txRecoilState } from 'state/txRecoilState'
import { TxStep } from 'types/common'
import { parseError } from 'util/parseError'

type Simulate = {
  msgs: EncodeObject[]
  signingClient: SigningCosmWasmClient | InjectiveSigningStargateClient
  address: string | undefined
  connected: boolean
  amount: string
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
}

const useSimulate = ({
  msgs,
  signingClient,
  address,
  connected,
  amount,
  onError,
  onSuccess,
}: Simulate) => {
  const [txState, setTxState] = useRecoilState(txRecoilState)

  const simulate = useQuery({
    queryKey: ['simulate', msgs, amount],
    queryFn: () => {
      if (
        !connected ||
        Number(amount) <= 0 ||
        !address ||
        !signingClient ||
        !msgs
      ) {
        return null
      }

      setTxState({
        txStep: TxStep.Estimating,
        txHash: null,
        error: null,
        buttonLabel: null,
      })

      return signingClient?.simulate(
        address, msgs, null,
      )
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
        txHash: null,
        error: message,
        buttonLabel: message,
      })
      onError?.(error)
    },
    enabled: Boolean(msgs) && msgs?.length > 0 && Boolean(connected) && Number(amount) > 0,
    retry: false,
  })

  return {
    ...simulate,
    ...txState,
  }
}

export default useSimulate
