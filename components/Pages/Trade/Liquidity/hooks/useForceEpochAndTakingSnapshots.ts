import { useMemo } from 'react'
import { useMutation } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite'
import { Config } from 'components/Pages/Bonding/hooks/useDashboardData'
import { useQueryIncentiveContracts } from 'components/Pages/Trade/Incentivize/hooks/useQueryIncentiveContracts'
import { ADV_MEMO, ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { useClients } from 'hooks/useClients'
import useTxStatus from 'hooks/useTxStatus'
import { useRecoilValue } from 'recoil'
import { createGasFee } from 'services/treasuryService'
import { chainState } from 'state/chainState'
import { createExecuteMessage } from 'util/messages/index'

export enum Force {
  epochAndSnapshots,
  snapshotsOnly,
}

type Params = {
  noSnapshotTakenAddresses?: Array<string>
  config: Config
}
const useForceEpochAndTakingSnapshots = ({
  noSnapshotTakenAddresses,
  config,
}: Params) => {
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient, injectiveSigningClient, cosmWasmClient } = useClients(walletChainName)
  const incentiveAddresses = useQueryIncentiveContracts(cosmWasmClient)
  const mode = useMemo(() => (noSnapshotTakenAddresses ? Force.snapshotsOnly : Force.epochAndSnapshots),
    [noSnapshotTakenAddresses])

  const addresses =
    useMemo(() => (mode === Force.snapshotsOnly
      ? noSnapshotTakenAddresses
      : incentiveAddresses),
    [incentiveAddresses]) ?? []

  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType:
      mode === Force.epochAndSnapshots
        ? 'Epoch Creation And Snapshots Taken'
        : 'Taking Snapshots',
    signingClient,
  })

  const msgs = useMemo(() => {
    if (addresses.length === 0) {
      return null
    }

    return (
      mode === Force.epochAndSnapshots
        ? [
          // Create new epoch message
          createExecuteMessage({
            message: {
              new_epoch: {},
            },
            senderAddress: address,
            contractAddress: config?.fee_distributor,
            funds: [],
          }),
        ]
        : []
    ).concat(...(addresses?.flatMap((incentiveAddress) => [
      // Create snapshot message
      createExecuteMessage({
        message: {
          take_global_weight_snapshot: {},
        },
        senderAddress: address,
        contractAddress: incentiveAddress,
        funds: [],
      }),
    ]) ?? []))
  }, [addresses, address])

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

export default useForceEpochAndTakingSnapshots
