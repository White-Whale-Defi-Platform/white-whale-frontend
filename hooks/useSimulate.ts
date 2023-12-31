import { useQuery } from 'react-query'

import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { EncodeObject } from '@cosmjs/proto-signing'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { ChainId } from 'constants/index'
import { useRecoilState } from 'recoil'
import { txRecoilState } from 'state/txRecoilState'
import { TxStep } from 'types/common'
import { parseError } from 'util/parseError'

type Simulate = {
  msgs: EncodeObject[]
  signingClient: SigningCosmWasmClient
  address: string | undefined
  connected: boolean
  amount: string
  injectiveSigningClient?: InjectiveSigningStargateClient
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
}

const useSimulate = ({
  msgs,
  signingClient,
  injectiveSigningClient,
  address,
  connected,
  amount,
  onError,
  onSuccess,
}: Simulate) => {
  const [txState, setTxState] = useRecoilState(txRecoilState)

  const simulate = useQuery({
    queryKey: ['simulate', msgs, amount],
    queryFn: async () => {
      if (
        !connected ||
        Number(amount) <= 0 ||
        !address ||
        !signingClient ||
        !injectiveSigningClient ||
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
      const isInjective = await signingClient.getChainId() === ChainId.injective
      return isInjective && injectiveSigningClient ? injectiveSigningClient?.simulate(
        address, msgs, null,
      ) : signingClient?.simulate(
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
