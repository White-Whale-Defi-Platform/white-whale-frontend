import { useMemo } from 'react'
import { useMutation } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { createExecuteMessage } from 'util/messages'
import useTxStatus from 'hooks/useTxStatus'
import { IncentiveConfig } from 'components/Pages/Incentivize/hooks/useIncentiveConfig'
import { useQueryIncentiveContracts } from 'components/Pages/Incentivize/hooks/useQueryIncentiveContracts'

export enum Force {
  epochAndSnapshots,
  snapshotsOnly,
}

type Params = {
  noSnapshotTakenAddresses?: Array<string>
  config: IncentiveConfig
}
const useForceEpochAndTakingSnapshots = ({
  noSnapshotTakenAddresses,
  config,
}: Params) => {
  const { address, client } = useRecoilValue(walletState)
  const incentiveAddresses = useQueryIncentiveContracts(client)

  const mode = useMemo(
    () =>
      noSnapshotTakenAddresses ? Force.snapshotsOnly : Force.epochAndSnapshots,
    [noSnapshotTakenAddresses]
  )
  const addresses = useMemo(
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
    client,
  })

  const msgs = useMemo(() => {
    if (addresses.length === 0) return null

    return (
      mode === Force.epochAndSnapshots
        ? [
            // create new epoch message
            createExecuteMessage({
              message: {
                new_epoch: {},
              },
              senderAddress: address,
              contractAddress: config?.fee_distributor_address,
              funds: [],
            }),
          ]
        : []
    ).concat(
      ...addresses.flatMap((incentiveAddress) => {
        return [
          // create snapshot message
          createExecuteMessage({
            message: {
              take_global_weight_snapshot: {},
            },
            senderAddress: address,
            contractAddress: incentiveAddress,
            funds: [],
          }),
        ]
      })
    )
  }, [addresses, address])

  const { mutate: submit, ...state } = useMutation({
    mutationFn: () => client.post(address, msgs),
    onError,
    onSuccess,
  })

  return useMemo(() => {
    return {
      submit,
      ...state,
      ...tx,
    }
  }, [tx, state, submit])
}

export default useForceEpochAndTakingSnapshots
