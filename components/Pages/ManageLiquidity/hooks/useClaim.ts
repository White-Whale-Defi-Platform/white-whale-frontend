import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { fromUtf8 } from '@cosmjs/encoding'
import { coin } from '@cosmjs/stargate'
import { useMemo } from 'react'
import { useMutation } from 'react-query'
import { useRecoilValue } from 'recoil'

// import { TokenInfo } from '../../queries/usePoolsListQuery'
import {
    createExecuteMessage,
    createIncreaseAllowanceMessage,
    validateTransactionSuccess,
} from 'util/messages'
import { Wallet } from 'util/wallet-adapters'
import { toChainAmount } from 'libs/num'
import { usePoolFromListQueryById, usePoolsListQuery } from 'queries/usePoolsListQuery'
import { walletState } from 'state/atoms/walletAtoms'
import { AssetInfo } from 'types/terraswap'
import useTxStatus from './useTx'

interface Props {
    poolId: string
}


export const useClaim = ({poolId}:Props) => {

    const { address, client } = useRecoilValue(walletState)
    const [pool] = usePoolFromListQueryById({ poolId })
    const { onError, onSuccess, ...tx } = useTxStatus({ transcationType: 'Claim', client })

    const executeAddLiquidityMessage = createExecuteMessage({
        message: {
            claim: {}
        },
        senderAddress: address,
        contractAddress: pool?.staking_address,
        funds: [],
    })

    const msgs = [
        executeAddLiquidityMessage,
    ]

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
