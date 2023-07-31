import { JsonObject } from '@cosmjs/cosmwasm-stargate'
import { Wallet } from 'util/wallet-adapters'

import { Config } from './useDashboardData'

export interface WeightInfo {
  address: string
  weight: string
  global_weight: string
  share: string
  timestamp: string
}

export const getWeight = async (
  client: Wallet,
  address: string,
  config: Config
) => {
  if (!client || !address) {
    return null
  }
  try {
    const weightInfo = await fetchWeight(client, address, config)

    return { weightInfo }
  } catch (e) {
    return 0
  }
}

const fetchWeight = async (
  client: Wallet,
  address: string,
  config: Config
): Promise<WeightInfo> => {
  const result: JsonObject = await client.queryContractSmart(
    config.whale_lair,
    {
      weight: { address },
    }
  )

  return result as WeightInfo
}
