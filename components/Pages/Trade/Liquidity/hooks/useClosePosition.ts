import { useMemo } from 'react'
import { useMutation } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite'
import { PoolEntityType } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { ADV_MEMO, ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { useClients } from 'hooks/useClients'
import useTxStatus from 'hooks/useTxStatus'
import { useRecoilValue } from 'recoil'
import { createGasFee } from 'services/treasuryService'
import { chainState } from 'state/chainState'
import { createExecuteMessage, validateTransactionSuccess } from 'util/messages/index'
import { isNativeToken } from '../../../../../services/asset'

type OpenPosition = {
  item: any
  pool: PoolEntityType
}

export const useClosePosition = ({ item, pool }: OpenPosition) => {
  const { walletChainName, chainId } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient, injectiveSigningClient } = useClients(walletChainName)
  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType: 'Close Position',
    signingClient,
  })

  const createClosePositionMessage = (unbonding_duration: number) => {
    let msg = createExecuteMessage({
      message: {
        close_position: {
          unbonding_duration,
        },
      },
      senderAddress: address,
      contractAddress: pool.staking_address,
      funds: [],
    })

    if (unbonding_duration === -1 && chainId === ChainId.terra && item?.liquidity_alliance) {
      const tokenInfo = isNativeToken(pool.lp_token)
    ? { native: pool.lp_token }
    : { cw20: pool.lp_token};

      msg = createExecuteMessage({
        message: {
          unstake: {
            asset: {
              amount: String(item.amount),
              info: tokenInfo,
            },
          },
        },
        senderAddress: address,
        contractAddress: item.bribe_market,
        funds: [],
      })
    }
    return [msg]
  }

  const { mutate: submit, ...state } = useMutation({
    mutationFn: async ({
      unbonding_duration,
    }: {
      unbonding_duration: number
    }) => {
      const msgs = createClosePositionMessage(unbonding_duration)
      if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
        const injectiveTxData = await injectiveSigningClient.sign(
          address, msgs, await createGasFee(
            injectiveSigningClient, address, msgs,
          ), ADV_MEMO,
        )
        return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
      }
      return await validateTransactionSuccess(await signingClient.signAndBroadcast(
        address, msgs, await createGasFee(
          signingClient, address, msgs,
        ), ADV_MEMO,
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
