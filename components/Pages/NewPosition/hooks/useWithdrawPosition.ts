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
import useTx from './useTx'

type OpenPosition = {
    // amount: number
    // poolId: string
}


export const useWithdrawPosition = ({poolId}) => {

    const { address, client } = useRecoilValue(walletState)
    const [pool] = usePoolFromListQueryById({ poolId })
    const { onError, onSuccess, ...tx } = useTx({ transcationType: 'Open positiion', client })


    const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []
    // increaseAllowanceMessages.push(
    //     createIncreaseAllowanceMessage({
    //         tokenAmount: Number(amount),
    //         tokenAddress: pool?.lp_token,
    //         senderAddress: address,
    //         swapAddress: pool?.staking_address,
    //     })
    // )

    const executeAddLiquidityMessage = createExecuteMessage({
        message: {
            withdraw: {}
        },
        senderAddress: address,
        contractAddress: pool?.staking_address,
        funds: [],
    })

    const msgs = [
        // ...increaseAllowanceMessages,
        executeAddLiquidityMessage,
    ]

    // console.log({
    //     msgs,
    //     allowance: JSON.parse(fromUtf8(increaseAllowanceMessages[0].value.msg)),
    //     execute: JSON.parse(fromUtf8(executeAddLiquidityMessage.value.msg))
    // })

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
