import {Wallet} from 'util/wallet-adapters';
import {convertMicroDenomToDenom} from "util/conversion";
import {Config} from "./useDashboardData";

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
    return null;
  }

  const unbondingInfos = await fetchUnbonding(client, address, config);

  const unbondingPeriod = 60 * 1_000_000_000;
  const currentTimeInNanoseconds = Date.now() * 1_000_000;

  const filterUnbondingRequests = (unbondingRequests) => {
    return unbondingRequests.filter(
      (req) => Number(req.timestamp) + unbondingPeriod > currentTimeInNanoseconds
    );
  };
  const filteredAmpWhaleUnbondingRequests = filterUnbondingRequests(unbondingInfos?.[0]?.unbonding_requests);
  const filteredBWhaleUnbondingRequests = filterUnbondingRequests(unbondingInfos?.[1]?.unbonding_requests);

  const filteredUnbondingRequests: UnbondingRequest[] = [...(filteredAmpWhaleUnbondingRequests || []), ...(filteredBWhaleUnbondingRequests || [])];

  const unbondingAmpWhale = convertMicroDenomToDenom(filteredAmpWhaleUnbondingRequests?.map(req => req.asset.amount).reduce((accumulator: number, currentValue: string) => {
    return accumulator + parseFloat(currentValue);
  }, 0) || 0, 6);

  const unbondingBWhale = convertMicroDenomToDenom(filteredBWhaleUnbondingRequests?.map(req => req.asset.amount).reduce((accumulator: number, currentValue: string) => {
    return accumulator + parseFloat(currentValue);
  }, 0) || 0, 6);

  return {unbondingAmpWhale, unbondingBWhale, filteredUnbondingRequests};
};

const fetchUnbonding = async (
  client: Wallet,
  address: string,
  config:Config
): Promise<UnbondingInfo[]> => {

  const results : UnbondingInfo[] = await Promise.all(
    Object.entries(config.lsd_token).map(async ([key, token]) => {
      return await client.queryContractSmart(config.whale_lair_address, {
        unbonding: {address: address, denom: token.denom},
      });
    }))


  return results;
};
