import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { coin } from '@cosmjs/proto-signing'
import dayjs from 'dayjs'
import useSimulate from "hooks/useSimulate"
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery'
import { useMemo } from 'react'
import { useMutation } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { createExecuteMessage, createIncreaseAllowanceMessage } from 'util/messages'
import { useTokenInfo } from 'hooks/useTokenInfo'
import useTxStatus from 'hooks/useTxStatus'
import { num, toChainAmount } from 'libs/num'
import { createAsset } from 'services/asset'
import useFactoryConfig from './useFactoryConfig'
import { fromUtf8, toUtf8 } from '@cosmjs/encoding'
import useEpoch from './useEpoch'

interface Props {
    poolId: string
    token: any
    startDate:  string
    endDate:  string
}

export const useOpenFlow = ({ poolId, token, startDate, endDate }: Props) => {

    const { address, client } = useRecoilValue(walletState)
    const [pool] = usePoolFromListQueryById({ poolId })
    const { onError, onSuccess, onMutate } = useTxStatus({ transcationType: 'Open Flow', client })
    const tokenInfo = useTokenInfo(token?.tokenSymbol)
    const amount = toChainAmount(token.amount, tokenInfo?.decimals || 6)
    const config = useFactoryConfig(pool?.incentiveFactory)
    const { dateToEpoch } = useEpoch(poolId)


    const msgs = useMemo(() => {
        if (!poolId || !tokenInfo?.denom || !startDate || !endDate || Number(token?.amount || 0) <= 0) return null

        const flow_asset = createAsset(amount, tokenInfo.denom, tokenInfo?.native)
        const start_epoch = dateToEpoch(startDate)
        const end_epoch = dateToEpoch(endDate)


        const nativeAmount = tokenInfo?.denom === 'uwhale' ? num(amount).plus(config?.createFlowFee?.amount).toString() : amount

        const funds = [
            tokenInfo?.native && coin(nativeAmount, tokenInfo?.denom),
            config && tokenInfo?.denom !== 'uwhale' && coin(config?.createFlowFee?.amount, config?.createFlowFee?.denom),
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
                        start_epoch,
                        end_epoch,
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
    })

    const { mutate: submit, ...tx } = useMutation({
        mutationFn: () => client.post(address, msgs),
        onError,
        onSuccess,
        onMutate
    })

    return useMemo(() => {
        return {
            submit,
            simulate,
            tx
        }
    }, [tx, submit, simulate])
}
