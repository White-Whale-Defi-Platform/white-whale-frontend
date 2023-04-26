import { Wallet } from 'util/wallet-adapters'
import { JsonObject } from '@cosmjs/cosmwasm-stargate'
import { Config } from './useDashboardData'

interface NativeToken {
  denom: string;
}

export interface BondingAsset {
  native_token: NativeToken;
}

export interface BondingContractConfig {
  owner: string;
  unbonding_period: number;
  growth_rate: string;
  bonding_assets: BondingAsset[];
}

export const getBondingConfig = async (client: Wallet | null, config: Config) => {
  if (!client && !config) {
    return null
  }
  const bondingConfig = await fetchConfig(client, config)
  return { bondingConfig }
}

export const fetchConfig = async (client: Wallet, config: Config): Promise<BondingContractConfig> => {
  const result: JsonObject = await client.queryContractSmart(config.whale_lair_address, {
    config: {}
  })

  return result as BondingContractConfig
}
