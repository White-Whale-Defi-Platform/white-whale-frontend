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
import { createExecuteMessage } from 'util/messages/index'

import { useFetchLiquidityAlliances } from './useLiquidityAlliancePositions'

export const useClaim = (pool: PoolEntityType) => {
  console.log('Pool: ', pool)
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient, injectiveSigningClient } = useClients(walletChainName)
  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType: 'Claim',
    signingClient,
  })
  const { data: position, isLoading } = useFetchLiquidityAlliances(pool.lp_token)

  const bribeMarket = useMemo(() => {
    if (isLoading || !position?.length) {
      return null
    }
    return position[0]?.bribeMarket
  }, [position, isLoading])

  let msg = null
  if (!bribeMarket) {
    msg =
    createExecuteMessage({
      message: {
        claim: {},
      },
      senderAddress: address,
      contractAddress: pool.staking_address,
      funds: [],
    })
  } else {
    msg = createExecuteMessage({
      message: {
        claim_reward: {
          native: pool.lp_token,
        },
      },
      senderAddress: address,
      contractAddress: bribeMarket,
      funds: [],
    })
  }

  const { mutate: submit, ...state } = useMutation({
    mutationFn: async () => {
      if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
        const injectiveTxData = await injectiveSigningClient.sign(
          address, [msg], await createGasFee(
            injectiveSigningClient, address, [msg],
          ), ADV_MEMO,
        )
        return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
      }
      return await signingClient.signAndBroadcast(
        address, [msg], await createGasFee(
          signingClient, address, [msg],
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
