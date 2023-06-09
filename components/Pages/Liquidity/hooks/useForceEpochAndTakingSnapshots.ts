import { useMemo } from 'react'
import { useMutation } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { createExecuteMessage } from 'util/messages'
import useTxStatus from 'hooks/useTxStatus'
import { IncentiveConfig } from 'components/Pages/Incentivize/hooks/useIncentiveConfig'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'

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
  const { data: poolList } = usePoolsListQuery()
  const mode = useMemo(
    () =>
      noSnapshotTakenAddresses ? Force.snapshotsOnly : Force.epochAndSnapshots,
    [noSnapshotTakenAddresses]
  )
  const incentiveAddresses =
    mode === Force.snapshotsOnly
      ? noSnapshotTakenAddresses
      : useMemo(
          () => poolList.pools.map((pool) => pool.staking_address),
          [poolList]
        )

  const { onError, onSuccess, ...tx } = useTxStatus({
    transactionType:
      mode === Force.epochAndSnapshots
        ? 'Epoch Created And Snapshots Taken'
        : 'Taking Snapshots',
    client,
  })

  const msgs = useMemo(() => {
    if (incentiveAddresses.length === 0) return null

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
      ...incentiveAddresses.flatMap((incentiveAddress) => {
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
  }, [incentiveAddresses, address])

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
