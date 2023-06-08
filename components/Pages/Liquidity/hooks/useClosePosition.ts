import { usePoolFromListQueryById } from 'queries/usePoolsListQuery'
import { useMemo } from 'react'
import { useMutation } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { createExecuteMessage, validateTransactionSuccess } from 'util/messages'
import useTxStatus from 'hooks/useTxStatus'

type OpenPosition = {
  poolId: string
}

export const useClosePosition = ({ poolId }: OpenPosition) => {
  const { address, client } = useRecoilValue(walletState)
  const [pool] = usePoolFromListQueryById({ poolId })
  const { onError, onSuccess, ...tx } = useTxStatus({
    transcationType: 'Close positiion',
    client,
  })

  const createClosPositionMessage = (unbonding_duration: number) => {
    const msg = createExecuteMessage({
      message: {
        close_position: {
          unbonding_duration,
        },
      },
      senderAddress: address,
      contractAddress: pool?.staking_address,
      funds: [],
    })

    return [msg]
  }

  const { mutate: submit, ...state } = useMutation({
    mutationFn: async ({
      unbonding_duration,
    }: {
      unbonding_duration: number
    }) => {
      const msgs = createClosPositionMessage(unbonding_duration)

      return validateTransactionSuccess(await client.post(address, msgs))
    },
    onError,
    onSuccess,
  })

  return useMemo(() => {
    return {
      submit,
      ...state,
      ...tx,
    }
  }, [tx, state, submit])
}
