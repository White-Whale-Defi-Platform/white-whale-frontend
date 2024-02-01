import { CosmWasmClient, JsonObject } from '@cosmjs/cosmwasm-stargate'

import { Config } from './useDashboardData'

export interface FeeDistributionConfig {
  owner: string
  bonding_contract_addr: string
  fee_collector_addr: string
  grace_period: string
  epoch_config: {
    duration: string
    genesis_epoch: string
  }
  distribution_asset: {
    native_token: {
      denom: string
    }
  }
}

const fetchConfig = async (client: CosmWasmClient,
  config: Config): Promise<FeeDistributionConfig> => {
  // TODO: API

  const result: JsonObject = await client.queryContractSmart(config.fee_distributor,
    {
      config: {},
    })

  return result as FeeDistributionConfig
}
export const getFeeDistributorConfig = async (client: CosmWasmClient,
  config: Config) => {
  if (!client) {
    return null
  }
  const feeDistributionConfig = await fetchConfig(client, config)

  return { feeDistributionConfig }
}

