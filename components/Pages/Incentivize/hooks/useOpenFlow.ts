import { useMemo } from 'react'
import { useMutation } from 'react-query'

import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { coin } from '@cosmjs/proto-signing'
import {
  Config,
  useConfig,
} from 'components/Pages/Dashboard/hooks/useDashboardData'
import useSimulate from 'hooks/useSimulate'
import { useTokenInfo } from 'hooks/useTokenInfo'
import useTxStatus from 'hooks/useTxStatus'
import { num, toChainAmount } from 'libs/num'
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery'
import { useRecoilValue } from 'recoil'
import { createAsset } from 'services/asset'
import { chainState } from 'state/chainState'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
} from 'util/messages'

import useEpoch from './useEpoch'
import useFactoryConfig from './useFactoryConfig'
import { useClients } from 'hooks/useClients'

interface Props {
  poolId: string
  token: any
  startDate: string
  endDate: string
}

export const useOpenFlow = ({ poolId, token, startDate, endDate }: Props) => {
  const { address, chainName, network, chainId } = useRecoilValue(chainState)
  const { signingClient } = useClients(chainName)
  const config: Config = useConfig(network, chainId)
  const [pool] = usePoolFromListQueryById({ poolId })
  const { onError, onSuccess, onMutate } = useTxStatus({
    transactionType: 'Open Flow',
    signingClient,
  })
  const tokenInfo = useTokenInfo(token?.tokenSymbol)
  const amount = toChainAmount(token.amount, tokenInfo?.decimals || 6)
  const factoryConfig = useFactoryConfig(config?.incentive_factory)
  const flowFeeDenom = factoryConfig?.createFlowFee?.denom
  const { dateToEpoch } = useEpoch()

  const msgs = useMemo(() => {
    if (
      !poolId ||
      !tokenInfo?.denom ||
      !startDate ||
      !endDate ||
      Number(token?.amount || 0) <= 0
    ) {
      return null
    }

    const flow_asset = createAsset(amount, tokenInfo.denom, tokenInfo?.native)
    const start_epoch = dateToEpoch(startDate)
    const end_epoch = dateToEpoch(endDate)

    const nativeAmount =
      tokenInfo?.denom === flowFeeDenom
        ? num(amount).plus(factoryConfig?.createFlowFee?.amount).toString()
        : amount

    const funds = [
      factoryConfig &&
        tokenInfo?.denom !== flowFeeDenom &&
        coin(
          factoryConfig?.createFlowFee?.amount,
          factoryConfig?.createFlowFee?.denom
        ),
      tokenInfo?.native && coin(nativeAmount, tokenInfo?.denom),
    ]
      .filter(Boolean)
      .sort((a, b) => a.denom.localeCompare(b.denom))

    const increaseAllowanceMessages: Array<MsgExecuteContractEncodeObject> = []
    /* Increase allowance for each non-native token */
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
            curve: 'linear',
            flow_asset,
            start_epoch,
            end_epoch,
          },
        },
        senderAddress: address,
        contractAddress: pool?.staking_address,
        funds,
      }),
    ]
  }, [poolId, startDate, endDate, tokenInfo?.denom, token?.amount])

  const simulate = useSimulate({
    msgs,
    signingClient,
    address,
    connected: Boolean(address),
    amount,
  })

  const { mutate: submit, ...tx } = useMutation({
    mutationFn: () =>
      signingClient.signAndBroadcast(address, msgs, 'auto', null),
    onError,
    onSuccess,
    onMutate,
  })

  return useMemo(
    () => ({
      submit,
      simulate,
      tx,
    }),
    [tx, submit, simulate]
  )
}
