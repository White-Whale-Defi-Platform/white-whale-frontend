import { useMemo } from 'react'
import { useMutation } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite'
import { useClients } from 'hooks/useClients'
import useTxStatus from 'hooks/useTxStatus'
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { createExecuteMessage, validateTransactionSuccess } from 'util/messages/index'

import { TerraTreasuryService } from '../../../../../services/treasuryService'

type OpenPosition = {
  poolId: string
}

export const useClosePosition = ({ poolId }: OpenPosition) => {
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient } = useClients(walletChainName)
  const [pool] = usePoolFromListQueryById({ poolId })
  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType: 'Close Position',
    signingClient,
  })

  const createClosPositionMessage = (flow_id: number) => {
    const msg = createExecuteMessage({
      message: {
        close_flow: {
          flow_id,
        },
      },
      senderAddress: address,
      contractAddress: pool?.staking_address,
      funds: [],
    })

    return [msg]
  }

  const { mutate: submit, ...state } = useMutation({
    mutationFn: async ({ flowId }: { flowId: number }) => {
      const msg = createClosPositionMessage(flowId)
      try {
        await signingClient.simulate(
          address, msg, '',
        )
      } catch (e) {
        const err = e.toString()
        if (err.includes('unclaimed rewards')) {
          msg.push(createExecuteMessage({
            message: {
              claim: {},
            },
            senderAddress: address,
            contractAddress: pool?.staking_address,
            funds: [],
          }))
        }
      }

      console.log({ msg,
        flowId,
        poolId })
      let fee:any = 'auto'
      if (await signingClient.getChainId() === 'columbus-5') {
        const gas = Math.ceil(await signingClient.simulate(
          address, msg, '',
        ) * 1.3)
        fee = await TerraTreasuryService.getInstance().getTerraClassicFee(
          0, '', gas,
        )
      }
      return validateTransactionSuccess(await signingClient.signAndBroadcast(
        address, msg, fee, null,
      ))
    },
    onError,
    onSuccess,
  })

  return useMemo(() => ({
    submit,
    ...state,
    ...tx,
  }),
  [tx, state, submit])
}
