import { CosmWasmClient, JsonObject } from '@cosmjs/cosmwasm-stargate'

import { Config } from './useDashboardData'

export interface GlobalIndexInfo {
  bonded_amount: string
  bonded_assets: any
  weight: string
  timestamp: string
}

export const fetchGlobalIndex = async (client: CosmWasmClient,
  config: Config): Promise<GlobalIndexInfo> => {
  const result: JsonObject = await client.queryContractSmart(config.whale_lair,
    {
      global_index: {},
    })

  return result as GlobalIndexInfo
}

export const getGlobalIndex = async (client: CosmWasmClient,
  config: Config) => {
  if (!client) {
    return null
  }
  try {
    const globalIndexInfo = await fetchGlobalIndex(client, config)
    return { globalIndexInfo }
  } catch (e) {
    return 0
  }
}

