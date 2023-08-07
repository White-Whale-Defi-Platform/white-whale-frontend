import { useMemo } from 'react'
import { useMutation } from 'react-query'

import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { useQueryIncentiveContracts } from 'components/Pages/Incentivize/hooks/useQueryIncentiveContracts'
import useTxStatus from 'hooks/useTxStatus'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/atoms/chainState'
import { createExecuteMessage } from 'util/messages'
import { useChain } from '@cosmos-kit/react-lite'
import { useClients } from 'hooks/useClients'

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
  const { chainName } = useRecoilValue(chainState)
  const { address } = useChain(chainName)
  const { signingClient, cosmWasmClient } = useClients(chainName)
  const incentiveAddresses = useQueryIncentiveContracts(cosmWasmClient)
  const mode = useMemo(
    () =>
      noSnapshotTakenAddresses ? Force.snapshotsOnly : Force.epochAndSnapshots,
    [noSnapshotTakenAddresses]
  )
  const addresses =
    useMemo(
      () =>
        mode === Force.snapshotsOnly
          ? noSnapshotTakenAddresses
          : incentiveAddresses,
      [incentiveAddresses]
    ) ?? []

  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType:
      mode === Force.epochAndSnapshots
        ? 'Epoch Created And Snapshots Taken'
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
    ).concat(
      ...(addresses?.flatMap((incentiveAddress) => [
        // Create snapshot message
        createExecuteMessage({
          message: {
            take_global_weight_snapshot: {},
          },
          senderAddress: address,
          contractAddress: incentiveAddress,
          funds: [],
        }),
      ]) ?? [])
    )
  }, [addresses, address])

  const { mutate: submit, ...state } = useMutation({
    mutationFn: () =>
      signingClient.signAndBroadcast(address, msgs, 'auto', null),
    onError,
    onSuccess,
  })

  return useMemo(
    () => ({
      submit,
      ...state,
      ...tx,
    }),
    [tx, state, submit]
  )
}

export default useForceEpochAndTakingSnapshots
