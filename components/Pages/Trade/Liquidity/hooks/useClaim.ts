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

import { useAllianceRewards, useFetchLiquidityAlliances } from './useLiquidityAlliancePositions'

export const useClaim = (pool: PoolEntityType) => {
  const { data: allianceRewards } = useAllianceRewards()
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
    const reward_asset = position[0]?.config.reward_info.native
    return {
      reward_asset,
      reward_address: reward_asset?.split('/')[1],
      config: position[0]?.config,
      bribeMarket: position[0]?.bribeMarket
    }
  }, [position, isLoading])

  let msg = []
  if (!bribeMarket) {
    msg.push(
      createExecuteMessage({
        message: {
          claim: {},
        },
        senderAddress: address,
        contractAddress: pool.staking_address,
        funds: [],
      }))
  } else {
    msg.push(createExecuteMessage({
      message: {
        claim_reward: {
          asset: { native: pool.lp_token},
        },
      },
      senderAddress: address,
      contractAddress: bribeMarket.bribeMarket,
      funds: [],
    }))
  }

  const { mutate: submit, ...state } = useMutation({
    mutationFn: async () => {
      if (bribeMarket) {
        const reward = allianceRewards?.find((reward) => reward.staked_asset_share.info.native === pool.lp_token)
        const balance = await signingClient.getBalance(address, bribeMarket.reward_asset)
        const amount = { amount: String(Number(balance.amount) + Number(reward?.reward_asset.amount)), denom: balance.denom}
        msg.push(createExecuteMessage({
          message: {
            withdraw: {},
          },
          senderAddress: address,
          contractAddress: bribeMarket.reward_address,
          funds: [amount],
        }))
      }
      if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
        const injectiveTxData = await injectiveSigningClient.sign(
          address, msg, await createGasFee(
            injectiveSigningClient, address, msg,
          ), ADV_MEMO,
        )
        return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
      }
      return await signingClient.signAndBroadcast(
        address, msg, await createGasFee(
          signingClient, address, msg,
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
