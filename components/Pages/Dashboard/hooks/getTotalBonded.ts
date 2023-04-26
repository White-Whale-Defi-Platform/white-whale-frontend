import { Wallet } from 'util/wallet-adapters'
import { JsonObject } from '@cosmjs/cosmwasm-stargate'
import { convertMicroDenomToDenom } from 'util/conversion'
import { Config } from './useDashboardData'

interface NativeTokenInfo {
  native_token: {
    denom: string;
  };
}

interface Asset {
  amount: string;
  info: NativeTokenInfo;
}

interface TotalBondedInfo {
  bonded_assets: Asset[];
  total_bonded: string;
}

export const getTotalBonded = async (client: Wallet, config: Config) => {
  if (!client) {
    return null
  }
  try {
    const totalBondedInfo = await fetchTotalBonded(client, config)

    const globalTotalBonded = convertMicroDenomToDenom(totalBondedInfo?.total_bonded || 0, 6)

    return { globalTotalBonded }
  } catch (e) {
    return 0
  }
}
const fetchTotalBonded = async (client: Wallet, config: Config): Promise<TotalBondedInfo> => {
  const result: JsonObject = await client.queryContractSmart(config.whale_lair_address, {
    total_bonded: {}
  })
  return result as TotalBondedInfo
}

