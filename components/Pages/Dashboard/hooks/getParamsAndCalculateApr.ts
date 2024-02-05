import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { getClaimableEpochs } from 'components/Pages/Bonding/hooks/getClaimableEpochs'
import { getGlobalIndex } from 'components/Pages/Bonding/hooks/getGlobalIndex'
import { Config } from 'components/Pages/Bonding/hooks/useDashboardData'

export const getParamsAndCalculateApr = async (config: Config, client: CosmWasmClient) => {
  const { annualRewards } = await getClaimableEpochs(client, config)

  const globalInfo = await getGlobalIndex(client, config)

  return globalInfo?.weight ? (annualRewards * (1_000_000 / (Number(globalInfo?.weight) || 0))) * 100 : 0
}
