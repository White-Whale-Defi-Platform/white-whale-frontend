import useTxStatus from 'hooks/useTxStatus'
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery'
import { useMemo } from 'react'
import { useMutation } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import {
    createExecuteMessage, validateTransactionSuccess
} from 'util/messages'


export const useWithdrawPosition = ({poolId}) => {

    const { address, client } = useRecoilValue(walletState)
    const [pool] = usePoolFromListQueryById({ poolId })
    const { onError, onSuccess, ...tx } = useTxStatus({ transcationType: 'Open positiion', client })

    const executeAddLiquidityMessage = createExecuteMessage({
        message: {
            withdraw: {}
        },
        senderAddress: address,
        contractAddress: pool?.staking_address,
        funds: [],
    })

    const msgs = [
        executeAddLiquidityMessage,
    ]

    const { mutate: submit, ...state } = useMutation({
        mutationFn: async () => {
            return validateTransactionSuccess(
                await client.post(address, msgs)
            )
        },
        onError,
        onSuccess,
    })

    return useMemo(() => {
        return {
            submit,
            ...state,
            ...tx
        }
    }, [tx, state, submit])
}
