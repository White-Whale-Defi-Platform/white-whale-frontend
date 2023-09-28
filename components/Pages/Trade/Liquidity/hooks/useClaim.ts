import { useMemo } from 'react'
import { useMutation } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite'
import { useClients } from 'hooks/useClients'
import useTxStatus from 'hooks/useTxStatus'
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { createExecuteMessage } from 'util/messages/index'

import { TerraTreasuryService } from '../../../../../services/treasuryService'

interface Props {
  poolId: string
}

export const useClaim = ({ poolId }: Props) => {
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient } = useClients(walletChainName)
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
      let fee:any = 'auto'
      if (await signingClient.getChainId() === 'columbus-5') {
        const gas = Math.ceil(await signingClient.simulate(
          address, [msg], '',
        ) * 1.3)
        fee = await TerraTreasuryService.getInstance().getTerraClassicFee(
          0, '', gas,
        )
      } return signingClient.signAndBroadcast(
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