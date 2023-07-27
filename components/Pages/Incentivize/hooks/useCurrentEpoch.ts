import { useQuery } from 'react-query'

import { fetchCurrentEpoch } from 'components/Pages/Dashboard/hooks/getCurrentEpoch'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

export const useCurrentEpoch = (client, config) => {
  return useQuery(
    ['useCurrentEpoch'],
    async () => getCurrentEpoch(client, config),
    { enabled: !!client && !!config }
  )
}
export const getCurrentEpoch = async (
  client: CosmWasmClient,
  config: Config
) => {
  if (!client) {
    return null
  }

  const currentEpoch = await fetchCurrentEpoch(client, config)

  return { currentEpoch }
}
