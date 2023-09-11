import { useMemo } from 'react'
import { useMutation } from 'react-query'

import useTxStatus from 'hooks/useTxStatus'
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { createExecuteMessage, validateTransactionSuccess } from 'util/messages/index'

type OpenPosition = {
  poolId: string
}

export const useClosePosition = ({ poolId }: OpenPosition) => {
  const { address, client } = useRecoilValue(walletState)
  const [pool] = usePoolFromListQueryById({ poolId })
  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType: 'Close Position',
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

  return useMemo(() => ({
    submit,
    ...state,
    ...tx,
  }),
  [tx, state, submit])
}
