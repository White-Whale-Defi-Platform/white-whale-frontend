import { Wallet } from 'util/wallet-adapters'
import { JsonObject } from '@cosmjs/cosmwasm-stargate'
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

export const getFeeDistributorConfig = async (
  client: Wallet,
  config: Config
) => {
  if (!client) {
    return null
  }
  const feeDistributionConfig = await fetchConfig(client, config)

  return { feeDistributionConfig }
}

const fetchConfig = async (
  client: Wallet,
  config: Config
): Promise<FeeDistributionConfig> => {
  const result: JsonObject = await client.queryContractSmart(
    config.fee_distributor_address,
    {
      config: {},
    }
  )

  return result as FeeDistributionConfig
}
