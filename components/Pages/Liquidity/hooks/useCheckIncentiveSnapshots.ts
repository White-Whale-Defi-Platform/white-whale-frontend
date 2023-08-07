import { useQuery } from 'react-query'

import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { useCurrentEpoch } from 'components/Pages/Incentivize/hooks/useCurrentEpoch'
import { useQueryIncentiveContracts } from 'components/Pages/Incentivize/hooks/useQueryIncentiveContracts'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

export const useCheckIncentiveSnapshots = (
  cosmWasmClient: CosmWasmClient,
  config: Config
) => {
  const { data: currentEpochData } = useCurrentEpoch(cosmWasmClient, config)
  const epochId = currentEpochData?.currentEpoch?.epoch.id
  const incentiveAddresses = useQueryIncentiveContracts(cosmWasmClient)
  const { data } = useQuery(
    ['useCheckIncentiveSnapshots', incentiveAddresses, epochId],
    async () =>
      fetchCheckIncentiveSnapshots(cosmWasmClient, epochId, incentiveAddresses),
    {
      enabled:
        Boolean(cosmWasmClient) &&
        Boolean(incentiveAddresses) &&
        Boolean(epochId),
    }
  )
  return data ?? []
}

const fetchCheckIncentiveSnapshots = async (
  cosmWasmClient: CosmWasmClient,
  epochId: string,
  incentiveAddresses: Array<string>
) => {
  const noSnapshotTakenAddresses = []
  // Incentive contract aka staking address
  incentiveAddresses.map(async (incentiveAddress) => {
    try {
      await cosmWasmClient.queryContractSmart(incentiveAddress, {
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
  })
  return noSnapshotTakenAddresses
}
