import { CosmWasmClient, JsonObject } from '@cosmjs/cosmwasm-stargate'
import { convertMicroDenomToDenom } from 'util/conversion'

import { Config } from './useDashboardData'

interface NativeTokenInfo {
  native_token: {
    denom: string
  }
}

interface Asset {
  amount: string
  info: NativeTokenInfo
}

interface TotalBondedInfo {
  bonded_assets: Asset[]
  total_bonded: string
}

const fetchTotalBonded = async (client: CosmWasmClient,
  config: Config): Promise<TotalBondedInfo> => {
  const result: JsonObject = await client.queryContractSmart(config.whale_lair,
    {
      total_bonded: {},
    })
  return result as TotalBondedInfo
}

export const getTotalBonded = async (client: CosmWasmClient,
  config: Config) => {
  if (!client) {
    return null
  }
  try {
    const totalBondedInfo = await fetchTotalBonded(client, config)

    const globalTotalBonded = convertMicroDenomToDenom(totalBondedInfo?.total_bonded || 0,
      6)

    return { globalTotalBonded }
  } catch (e) {
    return 0
  }
}
