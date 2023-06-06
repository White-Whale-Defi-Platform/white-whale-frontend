import { useMemo } from 'react'
import { useMutation } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { createExecuteMessage } from 'util/messages'
import useTxStatus from 'hooks/useTxStatus'

interface Props {
    poolId: string
}

const useForeceEpoch = () => {

    const fee = "migaloo1l9lnd2qrtkejhj30lkjwfknkvtswgf7hrtzfwkse760wnajt78mq9skwjn"
    const incentive = "migaloo1aj2nax29c4l5lma8vk49v93lhu0g0ek7sfxw96antpersw6zk0ysqzzhs9"


    const { address, client } = useRecoilValue(walletState)
    const { onError, onSuccess, ...tx } = useTxStatus({ transcationType: 'Force epoch', client })

    // create new epoch message
    const newEpoch = createExecuteMessage({
        message: {
            new_epoch: {}
        },
        senderAddress: address,
        contractAddress: fee,
        funds: [],
    })

    // create snapshot message
    const snapshot = createExecuteMessage({
        message: {
            take_global_weight_snapshot: {}
        },
        senderAddress: address,
        contractAddress: incentive,
        funds: [],
    })

    const { mutate: submit, ...state } = useMutation({
        mutationFn: () => client.post(address, [newEpoch, snapshot]),
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
