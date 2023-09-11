import { useMemo } from 'react'
import { useMutation } from 'react-query'

import useTxStatus from 'hooks/useTxStatus'
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { createExecuteMessage } from 'util/messages/index'

interface Props {
  poolId: string
}

export const useClaim = ({ poolId }: Props) => {
  const { address, client } = useRecoilValue(walletState)
  const [pool] = usePoolFromListQueryById({ poolId })
  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType: 'Claim',
    client,
  })

  const msg = createExecuteMessage({
    message: {
      claim: {},
    },
    senderAddress: address,
    contractAddress: pool?.staking_address,
    funds: [],
  })

  const { mutate: submit, ...state } = useMutation({
    mutationFn: () => client.post(address, [msg]),
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
