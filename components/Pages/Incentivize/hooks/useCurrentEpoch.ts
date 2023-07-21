import { useQuery } from 'react-query'

import { fetchCurrentEpoch } from 'components/Pages/Dashboard/hooks/getCurrentEpoch'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { Wallet } from 'util/wallet-adapters/index'

export const useCurrentEpoch = (client, config) => {
  return useQuery(
    ['useCurrentEpoch'],
    async () => getCurrentEpoch(client, config),
    { enabled: !!client && !!config }
  )
}
export const getCurrentEpoch = async (client: Wallet, config: Config) => {
  if (!client) {
    return null
  }

  const currentEpoch = await fetchCurrentEpoch(client, config)

  return { currentEpoch }
}
