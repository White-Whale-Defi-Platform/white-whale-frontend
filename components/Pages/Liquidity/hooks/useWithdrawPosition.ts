import { useMemo } from 'react'
import { useMutation } from 'react-query'

import useTxStatus from 'hooks/useTxStatus'
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { createExecuteMessage, validateTransactionSuccess } from 'util/messages'
import { useClients } from 'hooks/useClients'

export const useWithdrawPosition = ({ poolId }) => {
  const { address, chainName } = useRecoilValue(chainState)
  const { signingClient } = useClients(chainName)
  const [pool] = usePoolFromListQueryById({ poolId })
  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType: 'Open position',
    signingClient,
  })

  const executeAddLiquidityMessage = createExecuteMessage({
    message: {
      withdraw: {},
    },
    senderAddress: address,
    contractAddress: pool?.staking_address,
    funds: [],
  })

  const msgs = [executeAddLiquidityMessage]

  const { mutate: submit, ...state } = useMutation({
    mutationFn: async () =>
      validateTransactionSuccess(
        await signingClient.signAndBroadcast(address, msgs, 'auto', null)
      ),
    onError,
    onSuccess,
  })

  return useMemo(
    () => ({
      submit,
      ...state,
      ...tx,
    }),
    [tx, state, submit]
  )
}
