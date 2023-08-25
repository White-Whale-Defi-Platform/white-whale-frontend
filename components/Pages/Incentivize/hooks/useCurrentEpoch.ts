import { useQuery } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { fetchCurrentEpoch } from 'components/Pages/Dashboard/hooks/getCurrentEpoch'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'

export const useCurrentEpoch = (client, config) => useQuery(
  ['useCurrentEpoch'], async () => getCurrentEpoch(client, config), {
    enabled: Boolean(client) && Boolean(config),
  },
)
export const getCurrentEpoch = async (client: CosmWasmClient,
  config: Config) => {
  if (!client) {
    return null
  }

  const currentEpoch = await fetchCurrentEpoch(client, config)

  return { currentEpoch }
}
