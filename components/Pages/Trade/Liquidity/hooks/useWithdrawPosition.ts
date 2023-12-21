import { useMemo } from 'react'
import { useMutation } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite';
import { usePoolFromListQueryById } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { useClients } from 'hooks/useClients';
import useTxStatus from 'hooks/useTxStatus'
import { useRecoilValue } from 'recoil'
import { TerraTreasuryService, getInjectiveFee } from 'services/treasuryService';
import { chainState } from 'state/chainState'
import { createExecuteMessage, validateTransactionSuccess } from 'util/messages/index'

export const useWithdrawPosition = ({ poolId }) => {
  const { walletChainName } = useRecoilValue(chainState)
  const { signingClient, cosmWasmClient } = useClients(walletChainName)
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
