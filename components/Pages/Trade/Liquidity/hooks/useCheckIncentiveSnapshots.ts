import { useQuery } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useCurrentEpoch } from 'components/Pages/Trade/Incentivize/hooks/useCurrentEpoch'
import { useQueryIncentiveContracts } from 'components/Pages/Trade/Incentivize/hooks/useQueryIncentiveContracts'

const fetchCheckIncentiveSnapshots = async (
  cosmWasmClient: CosmWasmClient,
  epochId: string,
  incentiveAddresses: Array<string>,
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
        epochId,
      )
      noSnapshotTakenAddresses.push(incentiveAddress)
    }
  })
  return noSnapshotTakenAddresses
}
export const useCheckIncentiveSnapshots = (cosmWasmClient: CosmWasmClient,
  { data: config, isLoading: isConfigLoading }) => {
  const { data: currentEpochData } = useCurrentEpoch(cosmWasmClient, config)
  const epochId = currentEpochData?.currentEpoch?.epoch.id
  const incentiveAddresses = useQueryIncentiveContracts(cosmWasmClient)
  const { data } = useQuery(
    ['useCheckIncentiveSnapshots', incentiveAddresses],
    async () => await fetchCheckIncentiveSnapshots(
      cosmWasmClient, epochId, incentiveAddresses,
    ),
    {
      enabled:
        Boolean(cosmWasmClient) &&
        Boolean(incentiveAddresses) &&
        Boolean(epochId) &&
        !isConfigLoading,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  )
  return data ?? []
}

