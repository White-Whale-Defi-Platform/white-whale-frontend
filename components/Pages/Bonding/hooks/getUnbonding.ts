import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { fetchConfig } from 'components/Pages/Bonding/hooks/getBondingConfig'
import { convertMicroDenomToDenom } from 'util/conversion'
import { nanoToMilli } from 'util/conversion/timeUtil'

import { Config } from './useDashboardData'

interface NativeToken {
  denom: string
}

interface AssetInfo {
  native_token: NativeToken
}

interface Asset {
  info: AssetInfo
  amount: string
}

export interface UnbondingRequest {
  asset: Asset
  timestamp: string
  weight: string
}

export interface UnbondingInfo {
  total_amount: string
  unbonding_requests: UnbondingRequest[]
}

export interface UnbondingData {
  amount: number
  denom: string
  timestamp: number
  tokenSymbol: string
}

const fetchUnbonding = async (
  client: CosmWasmClient,
  address: string,
  config: Config,
): Promise<UnbondingInfo[]> => await Promise.all(Object.entries(config.bonding_tokens).map(async ([_, token]) => await client.queryContractSmart(config.whale_lair, {
  unbonding: {
    address,
    denom: token.denom,
  },
})))

export const getUnbonding = async (
  client: CosmWasmClient,
  address: string,
  config: Config,
) => {
  if (!client || !address) {
    return null
  }
  const unbondingInfos = await fetchUnbonding(
    client, address, config,
  )
  const bondingContractConfig = await fetchConfig(client, config)

  const unbondingPeriodInNano = Number(bondingContractConfig?.unbonding_period)
  const currentTimeInNano = Date.now() * 1_000_000

  // Filtering out unbonding requests which have already finished, so they won't get shown
  const filterAndBundleUnbondingRequests = (unbondingInfos) => {
    const allUnbondingRequests = unbondingInfos?.flatMap((item) => item.unbonding_requests)

    if (!allUnbondingRequests) {
      return []
    }
    return allUnbondingRequests.filter((req) => Number(req.timestamp) + unbondingPeriodInNano > currentTimeInNano)
  }
  const unbondingRequests: UnbondingData[] = filterAndBundleUnbondingRequests(unbondingInfos).
    sort((a, b) => new Date(nanoToMilli(Number(a.timestamp))).getTime() -
      new Date(nanoToMilli(Number(b.timestamp))).getTime()).
    map((req) => {
      const tokenSymbol = [...config.bonding_tokens, config.native_token].find((token) => token.denom === req.asset.info.native_token.denom)?.symbol

      return {
        denom: req.asset.info.native_token.denom,
        timestamp: req.timestamp,
        amount: convertMicroDenomToDenom(req.asset.amount, 6),
        tokenSymbol,
      }
    })

  return { unbondingRequests }
}

