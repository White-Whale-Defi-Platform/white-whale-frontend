import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { fetchCurrentEpoch } from 'components/Pages/Bonding/hooks/getCurrentEpoch'
import { Config } from 'components/Pages/Bonding/hooks/useDashboardData'

export const getDailyBuybacks = async (config: Config, client: CosmWasmClient) => {
  const { epoch: { total } } = await fetchCurrentEpoch(client, config)

  return Number(total[0].amount) * (10 ** -6)
}
