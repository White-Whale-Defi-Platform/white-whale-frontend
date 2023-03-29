import {Wallet} from '../../../../util/wallet-adapters';
import {
  AMP_WHALE_DENOM, B_WHALE_DENOM,
  BONDING_CONTRACT_ADDRESS,
} from '../../../../constants/bonding_contract';
import {JsonObject} from '@cosmjs/cosmwasm-stargate';
import {useQuery} from 'react-query';
import {convertMicroDenomToDenom} from "../../../../util/conversion";

interface UnbondingInfo {
  total_amount: string;
  unbonding_requests: UnbondingRequest[];
}

interface UnbondingRequest {
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

export const useUnbonding = (client: Wallet, address: string) => {

  const {data: unbondingInfos, isLoading, refetch} = useQuery(
    ['unbonding', address],
    () => {
      if (client && address) {
        return fetchUnbonding(client, address);
      } else {
        return Promise.resolve(null);
      }
    },
    {
      refetchOnMount:true,
      refetchIntervalInBackground: true,
    }
  );
  const unbondingPeriod = 60 * 1_000_000_000

  const currentTimeInNanoseconds = Date.now() * 1_000_000;

  const filteredAmpWhaleUnbondingRequests = unbondingInfos?.[0]?.unbonding_requests.filter(req=>((Number(req.timestamp)+unbondingPeriod) > currentTimeInNanoseconds))
  const filteredBWhaleUnbondingRequests = unbondingInfos?.[1]?.unbonding_requests.filter(req=>((Number(req.timestamp)+unbondingPeriod) > currentTimeInNanoseconds))
  const filteredUnbondingRequests: UnbondingRequest[] = [...(filteredAmpWhaleUnbondingRequests != null ? filteredAmpWhaleUnbondingRequests : [] ), ...(filteredBWhaleUnbondingRequests != null ? filteredBWhaleUnbondingRequests : [] )]

  const unbondingAmpWhale = convertMicroDenomToDenom(filteredAmpWhaleUnbondingRequests?.map(req => req.asset.amount).reduce((accumulator: number, currentValue: string) => {
    return accumulator + parseFloat(currentValue)
  }, 0) || 0, 6)

  const unbondingBWhale = convertMicroDenomToDenom(filteredBWhaleUnbondingRequests?.map(req => req.asset.amount).reduce((accumulator: number, currentValue: string) => {
    return accumulator + parseFloat(currentValue)
  }, 0) || 0, 6);

  const isLoadingExtended = unbondingInfos === null

  return {unbondingAmpWhale, unbondingBWhale,filteredUnbondingRequests, isLoading: isLoadingExtended, refetch};
};

export const fetchUnbonding = async (
  client: Wallet,
  address: string,
): Promise<UnbondingInfo[]> => {
  const resultAmp: JsonObject = await client.queryContractSmart(BONDING_CONTRACT_ADDRESS, {
    unbonding: {address: address, denom: AMP_WHALE_DENOM},
  });
  const resultB: JsonObject = await client.queryContractSmart(BONDING_CONTRACT_ADDRESS, {
    unbonding: {address: address, denom: B_WHALE_DENOM},
  });

  return [resultAmp, resultB] as UnbondingInfo[];
};
