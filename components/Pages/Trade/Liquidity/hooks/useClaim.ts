import { useMemo } from 'react'
import { useMutation } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite'
import { usePoolFromListQueryById } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { useClients } from 'hooks/useClients'
import useTxStatus from 'hooks/useTxStatus'
import { useRecoilValue } from 'recoil'
import { TerraTreasuryService } from 'services/treasuryService'
import { chainState } from 'state/chainState'
import { getInjectiveTxData } from 'util/injective'
import { createExecuteMessage } from 'util/messages/index'

interface Props {
  poolId: string
}

export const useClaim = ({ poolId }: Props) => {
  const { walletChainName, chainId } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient, injectiveSigningClient } = useClients(walletChainName)
  const [pool] = usePoolFromListQueryById({ poolId })
  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType: 'Claim',
    signingClient,
  })

  const msg = createExecuteMessage({
    message: {
      claim: {},
    },
    senderAddress: address,
    contractAddress: pool?.staking_address,
    funds: [],
  })

  const { mutate: submit, ...state } = useMutation({
    mutationFn: async () => {
      let fee: any = 'auto'
      if (chainId === ChainId.terrac) {
        const gas = Math.ceil(await signingClient.simulate(
          address, [msg], '',
        ) * 1.3)
        fee = await TerraTreasuryService.getInstance().getTerraClassicFee(null, gas)
      } else if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
        const injectiveTxData = await getInjectiveTxData(
          injectiveSigningClient, address, [msg],
        )

        return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
      }
      return await signingClient.signAndBroadcast(
        address, [msg], fee, null,
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
