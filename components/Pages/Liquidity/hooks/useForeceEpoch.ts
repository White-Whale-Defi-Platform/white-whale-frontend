import { useMemo } from 'react'
import { useMutation } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { createExecuteMessage } from 'util/messages'
import useTxStatus from 'hooks/useTxStatus'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'

const useForeceEpoch = () => {

    const { data: poolsList } = usePoolsListQuery()

    const { address, client } = useRecoilValue(walletState)
    const { onError, onSuccess, ...tx } = useTxStatus({ transcationType: 'Force epoch', client })

    const msgs = useMemo(() => {

        if (!poolsList) return null

        const pools = poolsList.pools.filter(pool => !!pool?.staking_address)

        return pools.flatMap(pool => {
            return [
                // create new epoch message
                createExecuteMessage({
                    message: {
                        new_epoch: {}
                    },
                    senderAddress: address,
                    contractAddress: pool?.feeDistributor,
                    funds: [],
                }),
                // create snapshot message
                createExecuteMessage({
                    message: {
                        take_global_weight_snapshot: {}
                    },
                    senderAddress: address,
                    contractAddress: pool?.staking_address,
                    funds: [],
                })
            ]
        })

    }, [poolsList, address])

    const { mutate: submit, ...state } = useMutation({
        mutationFn: () => client.post(address, msgs),
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

export default useForeceEpoch
