import type { CosmWasmClient, JsonObject } from '@cosmjs/cosmwasm-stargate'

import { Config } from './useDashboardData'

export interface WeightInfo {
  address: string
  weight: string
  global_weight: string
  share: string
  timestamp: string
}

const fetchWeight = async (
  client: CosmWasmClient,
  address: string,
  config: Config,
): Promise<WeightInfo> => {
  const result: JsonObject = await client.queryContractSmart(config.whale_lair,
    {
      weight: { address },
    })

  return result as WeightInfo
}

export const getWeight = async (
  client: CosmWasmClient,
  address: string,
  config: Config,
) => {
  if (!client || !address) {
    return null
  }
  try {
    const weightInfo = await fetchWeight(
      client, address, config,
    )

    return { weightInfo }
  } catch (e) {
    return 0
  }
}
