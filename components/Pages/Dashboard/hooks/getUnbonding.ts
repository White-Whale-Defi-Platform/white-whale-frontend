import { Wallet } from 'util/wallet-adapters'
import { convertMicroDenomToDenom, nanoToMilli } from 'util/conversion'
import { Config } from './useDashboardData'
import { fetchConfig } from 'components/Pages/Dashboard/hooks/getBondingConfig'

export interface UnbondingInfo {
  total_amount: string;
  unbonding_requests: UnbondingRequest[];
}

export interface UnbondingRequest {
  asset: Asset;
  timestamp: string;
  weight: string;
}

interface Asset {
  info: AssetInfo;
  amount: string;
}

interface AssetInfo {
  native_token: NativeToken;
}

interface NativeToken {
  denom: string;
}

export const getUnbonding = async (client: Wallet, address: string, config: Config) => {
  if (!client || !address) {
    return null
  }

  const unbondingInfos = await fetchUnbonding(client, address, config)
  const bondingContractConfig = await fetchConfig(client, config)

  const unbondingPeriodInNano = Number(bondingContractConfig?.unbonding_period)
  const currentTimeInNano = Date.now() * 1_000_000

  // filtering out unbonding requests which have already finished, so they won't get shown
  const filterUnbondingRequests = (unbondingRequests) => {
    return unbondingRequests.filter(
      (req) => Number(req.timestamp) + unbondingPeriodInNano > currentTimeInNano
    )
  }
  const filteredAmpWhaleUnbondingRequests = filterUnbondingRequests(unbondingInfos?.[0]?.unbonding_requests)
  const filteredBWhaleUnbondingRequests = filterUnbondingRequests(unbondingInfos?.[1]?.unbonding_requests)

  const filteredUnbondingRequests: UnbondingRequest[] = [...(filteredAmpWhaleUnbondingRequests || []), ...(filteredBWhaleUnbondingRequests || [])].sort((a, b) => new Date(nanoToMilli(Number(a.timestamp))).getTime() - new Date(nanoToMilli(Number(b.timestamp))).getTime())

  const unbondingAmpWhale = convertMicroDenomToDenom(filteredAmpWhaleUnbondingRequests?.map(req => req.asset.amount).reduce((accumulator: number, currentValue: string) => {
    return accumulator + parseFloat(currentValue)
  }, 0) || 0, config.lsd_token.ampWHALE.decimals)

  const unbondingBWhale = convertMicroDenomToDenom(filteredBWhaleUnbondingRequests?.map(req => req.asset.amount).reduce((accumulator: number, currentValue: string) => {
    return accumulator + parseFloat(currentValue)
  }, 0) || 0, config.lsd_token.bWHALE.decimals)

  return { unbondingAmpWhale, unbondingBWhale, filteredUnbondingRequests }
}

const fetchUnbonding = async (
  client: Wallet,
  address: string,
  config: Config
): Promise<UnbondingInfo[]> => {

  const results: UnbondingInfo[] = await Promise.all(
    Object.entries(config.lsd_token).map(async ([key, token]) => {
      return await client.queryContractSmart(config.whale_lair_address, {
        unbonding: { address: address, denom: token.denom }
      })
    }))


  return results
}
