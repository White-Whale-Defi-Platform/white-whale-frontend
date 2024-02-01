import { useMemo } from 'react'
import { useMutation } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite';
import { usePoolFromListQueryById } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { ADV_MEMO, ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { useClients } from 'hooks/useClients';
import useTxStatus from 'hooks/useTxStatus'
import { useRecoilValue } from 'recoil'
import { createGasFee } from 'services/treasuryService';
import { chainState } from 'state/chainState'
import { createExecuteMessage } from 'util/messages/index'

export const useWithdrawPosition = ({ poolId }) => {
  const { walletChainName } = useRecoilValue(chainState)
  const { signingClient, injectiveSigningClient } = useClients(walletChainName)
  const { address } = useChain(walletChainName)
  const [pool] = usePoolFromListQueryById({ poolId })
  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType: 'Unlock Position',
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
      if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
        const injectiveTxData = await injectiveSigningClient.sign(
          address, msgs, await createGasFee(
            injectiveSigningClient, address, msgs,
          ), ADV_MEMO,
        )
        return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
      }
      return await signingClient.signAndBroadcast(
        address, msgs, await createGasFee(
          signingClient, address, msgs,
        ), ADV_MEMO,
      )
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
