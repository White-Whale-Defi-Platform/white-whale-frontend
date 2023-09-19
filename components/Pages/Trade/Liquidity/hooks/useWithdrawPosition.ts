import { useMemo } from 'react'
import { useMutation } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite';
import { useClients } from 'hooks/useClients';
import useTxStatus from 'hooks/useTxStatus'
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { createExecuteMessage, validateTransactionSuccess } from 'util/messages/index'

import { TerraTreasuryService } from '../../../../../services/treasuryService';

export const useWithdrawPosition = ({ poolId }) => {
  const { walletChainName } = useRecoilValue(chainState)
  const { signingClient } = useClients(walletChainName)
  const { address } = useChain(walletChainName)
  const [pool] = usePoolFromListQueryById({ poolId })
  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType: 'Open position',
    signingClient,
  })

  const executeAddLiquidityMessage = createExecuteMessage({
    message: {
      withdraw: {},
    },
    senderAddress: address,
    contractAddress: pool?.staking_address,
    funds: [],
  })

  const msgs = [executeAddLiquidityMessage]

  const { mutate: submit, ...state } = useMutation({
    mutationFn: async () => {
      let fee:any = 'auto'
      if (await signingClient.getChainId() === 'columbus-5') {
        const gas = Math.ceil(await signingClient.simulate(
          address, msgs, '',
        ) * 1.3)
        fee = await TerraTreasuryService.getInstance().getTerraClassicFee(
          0, '', gas,
        )
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
