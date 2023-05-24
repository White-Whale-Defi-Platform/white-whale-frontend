import dayjs from 'dayjs'
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery'
import { useMemo } from 'react'
import { useMutation } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { createExecuteMessage } from 'util/messages'
import { createAsset } from '../../../../services/asset'
import useTxStatus from '../../Liquidity/hooks/useTx'
import useSimulate from "hooks/useSimulate"
import { fromUtf8 } from '@cosmjs/encoding'
import { useTokenInfo } from '../../../../hooks/useTokenInfo'
import { toChainAmount } from '../../../../libs/num'
import { coin } from '@cosmjs/proto-signing'
import { createIncreaseAllowanceMessage } from 'util/messages'
import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import useFactoryConfig from './useFactoryConfig'


interface Props {
    poolId: string
    token: any
    startDate: number
    endDate: number
}

export const useOpenFlow = ({ poolId, token, startDate, endDate }: Props) => {

    const { address, client } = useRecoilValue(walletState)
    const [pool] = usePoolFromListQueryById({ poolId })
    const { onError, onSuccess, onMutate, ...tx } = useTxStatus({ transcationType: 'Open Flow', client })
    const tokenInfo = useTokenInfo(token?.tokenSymbol)
    const amount = toChainAmount(token.amount, tokenInfo?.decimals || 6)
    const config = useFactoryConfig(pool?.incentiveFactory)

    console.log({config, incentiveFactory: pool?.incentiveFactory, pool, poolId})

    const msgs = useMemo(() => {
        if (!poolId || !tokenInfo?.denom || !startDate || !endDate || Number(token?.amount || 0) <= 0) return null

        const flow_asset = createAsset(amount, tokenInfo.denom, tokenInfo?.native)
        const start_timestamp = dayjs(startDate).unix()
        const end_timestamp = dayjs(endDate).unix()



        const funds = [
            tokenInfo?.native && coin(amount, tokenInfo?.denom),
            config && coin(config?.createFlowFee?.amount, config?.createFlowFee?.denom),
        ].filter(Boolean)

        const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []
        /* increase allowance for each non-native token */
        if (!tokenInfo?.native) {
            increaseAllowanceMessages.push(
                createIncreaseAllowanceMessage({
                    tokenAmount: Number(amount),
                    tokenAddress: tokenInfo?.denom,
                    senderAddress: address,
                    swapAddress: pool?.staking_address,
                })
            )
        }
        return [
            ...increaseAllowanceMessages,
            createExecuteMessage({
                message: {
                    open_flow: {
                        curve: "linear",
                        flow_asset,
                        start_timestamp,
                        end_timestamp,
                    }
                },
                senderAddress: address,
                contractAddress: pool?.staking_address,
                funds,
            })
        ]

    }, [poolId, startDate, endDate, tokenInfo?.denom, token?.amount]);

    const simulate = useSimulate({
        msgs,
        signingClient: client,
        address,
        connected: !!address,
        amount,
        // onError, 
        // onSuccess,
    })

    // console.log({ simulate, msgs : msgs.map(m => {
    //     return {
    //         ...m,
    //         value: {
    //             msg : JSON.parse(fromUtf8(m.value.msg))
    //         }

    //     }
    // }) })

    // if (msgs)
    //     console.log({ msg: JSON.parse(fromUtf8(msgs?.value.msg)), simulate, msgs: [msg].filter(Boolean) })

    console.log({ simulate, msgs })

    const { mutate: submit, ...state } = useMutation({
        mutationFn: () =>  client.post(address, msgs),
        // mutationFn: () => Promise.resolve({}),
        onError,
        onSuccess,
        onMutate
    })

    return useMemo(() => {
        return {
            submit,
            simulate,
            ...state,
            tx
        }
    }, [tx, state, submit, simulate])
}
