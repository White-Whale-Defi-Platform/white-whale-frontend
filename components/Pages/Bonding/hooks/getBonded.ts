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

export interface BondedData {
  denom: string
  amount: number
  tokenSymbol: string
}

const fetchBonded = async (
  client: CosmWasmClient,
  address: string,
  config: Config,
): Promise<BondedInfo> => {
  const result: JsonObject = await client.queryContractSmart(config.whale_lair,
    {
      bonded: { address },
    })
  return result as BondedInfo
}

export const getBonded = async (
  client: CosmWasmClient | null,
  address: string | null,
  config: Config,
) => {
  if (!client || !address) {
    return null
  }

  const myBondedInfo = await fetchBonded(
    client, address, config,
  )

  const myTotalBonding = Number(myBondedInfo?.total_bonded ?? 0)

  const myBondedAssets: BondedData[] = myBondedInfo?.bonded_assets.map((asset) => {
    const { denom } = asset.info.native_token
    const tokenSymbol = config.bonding_tokens.find((token) => token.denom === denom)?.tokenSymbol

    return {
      amount: convertMicroDenomToDenom(asset.amount, 6),
      denom: asset.info.native_token.denom,
      tokenSymbol,
    }
  })
  return { myBondedAssets,
    myTotalBonding }
}
