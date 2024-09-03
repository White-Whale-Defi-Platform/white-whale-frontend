import { useMemo } from 'react'
import { useMutation } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite';
import { ADV_MEMO, ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { useClients } from 'hooks/useClients';
import useTxStatus from 'hooks/useTxStatus'
import { useRecoilValue } from 'recoil'
import { createGasFee } from 'services/treasuryService';
import { chainState } from 'state/chainState'
import { createExecuteMessage } from 'util/messages/index'

export const useWithdrawPosition = ({ pool }) => {
  const { walletChainName } = useRecoilValue(chainState);
  const { signingClient, injectiveSigningClient } = useClients(walletChainName);
  const { address } = useChain(walletChainName);

  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType: 'Unlock Position',
    signingClient,
  });

  const executeWithdrawMessage = useMemo(() => {
    if (!pool) {
      return null;
    }

    return createExecuteMessage({
      message: {
        withdraw: {},
      },
      senderAddress: address,
      contractAddress: pool.staking_address,
      funds: [],
    });
  }, [pool, address]);

  const { mutate: submit, ...state } = useMutation({
    mutationFn: async () => {
      if (!executeWithdrawMessage) {
        throw new Error('Pool data not loaded');
      }

      const msgs = [executeWithdrawMessage];

      if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
        const injectiveTxData = await injectiveSigningClient.sign(
          address, msgs, await createGasFee(
            injectiveSigningClient, address, msgs,
          ), ADV_MEMO,
        );
        return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish());
      }

      return await signingClient.signAndBroadcast(
        address, msgs, await createGasFee(
          signingClient, address, msgs,
        ), ADV_MEMO,
      );
    },
    onError,
    onSuccess,
  });

  return useMemo(() => ({
    submit,
    ...state,
    ...tx,
  }), [tx, state, submit]);
};
