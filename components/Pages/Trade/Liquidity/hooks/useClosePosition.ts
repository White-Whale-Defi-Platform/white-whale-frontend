import { useMemo } from 'react'
import { useMutation } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite'
import { usePoolFromListQueryById } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { useClients } from 'hooks/useClients'
import useTxStatus from 'hooks/useTxStatus'
import { useRecoilValue } from 'recoil'
import { TerraTreasuryService, getInjectiveFee } from 'services/treasuryService'
import { chainState } from 'state/chainState'
import { createExecuteMessage, validateTransactionSuccess } from 'util/messages/index'

type OpenPosition = {
  poolId: string
}

export const useClosePosition = ({ poolId }: OpenPosition) => {
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient, cosmWasmClient } = useClients(walletChainName)
  const [pool] = usePoolFromListQueryById({ poolId })
  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType: 'Close Position',
    signingClient,
  })

  const createClosPositionMessage = (unbonding_duration: number) => {
    const msg = createExecuteMessage({
      message: {
        close_position: {
          unbonding_duration,
        },
      },
      senderAddress: address,
      contractAddress: pool?.staking_address,
      funds: [],
    })

    return [msg]
  }

  const { mutate: submit, ...state } = useMutation({
    mutationFn: async ({
      unbonding_duration,
    }: {
      unbonding_duration: number
    }) => {
      const msgs = createClosPositionMessage(unbonding_duration)
      let fee: any = 'auto'
      if (await signingClient.getChainId() === ChainId.terrac) {
        const gas = Math.ceil(await signingClient.simulate(
          address, msgs, '',
        ) * 1.3)
        fee = await TerraTreasuryService.getInstance().getTerraClassicFee(null, gas)
      } else if (await signingClient.getChainId() === ChainId.injective) {
        const gas = Math.ceil(await signingClient.simulate(
          address, msgs, '',
        ) * 1.3)
        const injectiveTxData = await signingClient.sign(
          address, msgs, getInjectiveFee(gas), '',
        )
        return await cosmWasmClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
      }
      return validateTransactionSuccess(await signingClient.signAndBroadcast(
        address, msgs, fee, null,
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
