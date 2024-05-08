import { CosmWasmClient, JsonObject } from '@cosmjs/cosmwasm-stargate'

import { Config } from './useDashboardData'

interface NativeToken {
  denom: string
}

export interface BondingAsset {
  native_token: NativeToken
}

export interface BondingContractConfig {
  owner: string
  unbonding_period: number
  growth_rate: string
  bonding_assets: BondingAsset[]
}

export const getBondingConfig = async (client: CosmWasmClient | null,
  config: Config) => {
  if (!client || !config?.whale_lair) {
    return null
  }
  const bondingConfig = await fetchConfig(client, config)
  return { bondingConfig }
}

export const fetchConfig = async (client: CosmWasmClient,
  config: Config): Promise<BondingContractConfig> => {
  // TODO: API
  if (!client || !config?.whale_lair) {
    return null
  }
  const result: JsonObject = await client.queryContractSmart(config?.whale_lair,
    {
      config: {},
    })

  return result as BondingContractConfig
}
