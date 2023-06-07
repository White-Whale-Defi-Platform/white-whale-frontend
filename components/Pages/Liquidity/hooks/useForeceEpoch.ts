import { useMemo } from 'react'
import { useMutation } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { createExecuteMessage } from 'util/messages'
import useTxStatus from 'hooks/useTxStatus'
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery'

interface Props {
    poolId: string
}

const useForeceEpoch = (poolId) => {

    const [pool] = usePoolFromListQueryById({ poolId })

    const {feeDistributor, staking_address} = pool

    // const fee = "migaloo1l9lnd2qrtkejhj30lkjwfknkvtswgf7hrtzfwkse760wnajt78mq9skwjn"
    // const incentive = "migaloo1aj2nax29c4l5lma8vk49v93lhu0g0ek7sfxw96antpersw6zk0ysqzzhs9"


    const { address, client } = useRecoilValue(walletState)
    const { onError, onSuccess, ...tx } = useTxStatus({ transcationType: 'Force epoch', client })

    // create new epoch message
    const newEpoch = createExecuteMessage({
        message: {
            new_epoch: {}
        },
        senderAddress: address,
        contractAddress: feeDistributor,
        funds: [],
    })

    // create snapshot message
    const snapshot = createExecuteMessage({
        message: {
            take_global_weight_snapshot: {}
        },
        senderAddress: address,
        contractAddress: staking_address,
        funds: [],
    })

    const { mutate: submit, ...state } = useMutation({
        mutationFn: () => client.post(address, [newEpoch, snapshot]),
        onError,
        onSuccess,
    })

    return useMemo(() => {
        return {
            isSupported: !!feeDistributor && !!staking_address,
            submit,
            ...state,
            ...tx
        }
    }, [tx, state, submit, feeDistributor, staking_address])
}

export default useForeceEpoch
