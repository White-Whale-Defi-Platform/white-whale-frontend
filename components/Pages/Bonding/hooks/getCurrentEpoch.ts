import { CosmWasmClient, JsonObject } from '@cosmjs/cosmwasm-stargate'

import { Config } from './useDashboardData'

export interface EpochData {
  id: string
  start_time: string
  total: {
    amount: string
    info: {
      native_token: {
        denom: string
      }
    }
  }[]
  available: {
    amount: string
    info: {
      native_token: {
        denom: string
      }
    }
  }[]
  claimed: {
    amount: string
    info: {
      native_token: {
        denom: string
      }
    }
  }[]
}

export interface Epoch {
  epoch: EpochData
}

export const fetchCurrentEpoch = async (client: CosmWasmClient,
  config: Config): Promise<Epoch> => {
  const result: JsonObject = await client?.queryContractSmart(config.fee_distributor,
    {
      current_epoch: {},
    })

  return result as Epoch
}

export const getCurrentEpoch = async (client: CosmWasmClient,
  config: Config) => {
  if (!client) {
    return null
  }

  const currentEpoch = await fetchCurrentEpoch(client, config)

  return { currentEpoch }
}
