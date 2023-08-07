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

interface BondedInfo {
  bonded_assets: Asset[]
  total_bonded: string
}

const fetchBonded = async (
  client: CosmWasmClient,
  address: string,
  config: Config
): Promise<BondedInfo> => {
  const result: JsonObject = await client.queryContractSmart(
    config.whale_lair,
    {
      bonded: { address },
    }
  )
  return result as BondedInfo
}

export const getBonded = async (
  client: CosmWasmClient | null,
  address: string | null,
  config: Config
) => {
  if (!client || !address) {
    return null
  }

  const bondedInfo = await fetchBonded(client, address, config)

  const totalBonded = bondedInfo?.total_bonded ?? 0

  const localTotalBonded = Number(totalBonded)

  const bondedAmpWhale = bondedInfo
    ? convertMicroDenomToDenom(
        bondedInfo?.bonded_assets.find(
          (asset) =>
            asset.info.native_token.denom === config.lsd_token.ampWHALE.denom
        )?.amount,
        config.lsd_token.ampWHALE.decimals
      )
    : null

  const bondedBWhale = bondedInfo
    ? convertMicroDenomToDenom(
        bondedInfo?.bonded_assets.find(
          (asset) =>
            asset.info.native_token.denom === config.lsd_token.bWHALE.denom
        )?.amount,
        config.lsd_token.bWHALE.decimals
      )
    : null

  return { bondedAmpWhale, bondedBWhale, localTotalBonded }
}
