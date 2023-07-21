import { useQuery } from 'react-query'

import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { useCurrentEpoch } from 'components/Pages/Incentivize/hooks/useCurrentEpoch'
import { useQueryIncentiveContracts } from 'components/Pages/Incentivize/hooks/useQueryIncentiveContracts'
import { Wallet } from 'util/wallet-adapters/index'

export const useCheckIncentiveSnapshots = (client: Wallet, config: Config) => {
  const { data: currentEpochData } = useCurrentEpoch(client, config)
  const epochId = currentEpochData?.currentEpoch?.epoch.id
  const incentiveAddresses = useQueryIncentiveContracts(client)
  const { data } = useQuery(
    ['useCheckIncentiveSnapshots', incentiveAddresses, epochId],
    async () =>
      fetchCheckIncentiveSnapshots(client, epochId, incentiveAddresses),
    { enabled: !!client && !!incentiveAddresses && !!epochId }
  )
  return data ?? []
}

const fetchCheckIncentiveSnapshots = async (
  client: Wallet,
  epochId: string,
  incentiveAddresses: Array<string>
) => {
  const noSnapshotTakenAddresses = []
  // incentive contract aka staking address
  incentiveAddresses.map(async (incentiveAddress) => {
    try {
      await client.queryContractSmart(incentiveAddress, {
        global_weight: { epoch_id: Number(epochId) },
      })
    } catch (e) {
      console.log(
        'error fetching global_weight for incentiveAddress ',
        incentiveAddress,
        ' epochId ',
        epochId
      )
      noSnapshotTakenAddresses.push(incentiveAddress)
    }
    return
  })
  return noSnapshotTakenAddresses
}
