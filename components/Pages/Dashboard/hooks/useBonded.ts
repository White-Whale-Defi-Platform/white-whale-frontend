import {Wallet} from "../../../../util/wallet-adapters";
import {
  AMP_WHALE_DENOM, B_WHALE_DENOM,
  BONDING_CONTRACT_ADDRESS,
} from "../../../../constants/bonding_contract";
import {JsonObject} from "@cosmjs/cosmwasm-stargate";
import {useQuery} from "react-query";
import {convertMicroDenomToDenom} from 'util/conversion'

interface NativeTokenInfo {
  native_token: {
    denom: string;
  };
}

interface Asset {
  amount: string;
  info: NativeTokenInfo;
}

interface BondedInfo {
  bonded_assets: Asset[];
  total_bonded: string;
}

export const useBonded = (client: Wallet | null, address: string | null) => {
  const {
    data: bondedInfo,
    isLoading,
    refetch,
  } = useQuery(
    ['bondedToken', address],
    () => {
      if (client && address) {
        return fetchBonded(client, address);
      } else {
        return Promise.resolve(null);
      }
    },
    {
      refetchOnMount:true,
      refetchIntervalInBackground: true,
    }
  )

  const localTotalBonded= convertMicroDenomToDenom(bondedInfo?.total_bonded || 0, 6)
  const bondedAmpWhale = bondedInfo ? convertMicroDenomToDenom(bondedInfo?.bonded_assets.find(asset => asset.info.native_token.denom === AMP_WHALE_DENOM)?.amount, 6) : null
  const bondedBWhale = bondedInfo ?  convertMicroDenomToDenom(bondedInfo?.bonded_assets.find(asset => asset.info.native_token.denom === B_WHALE_DENOM)?.amount, 6): null;
  const isLoadingExtended = bondedInfo === null
  return {bondedAmpWhale, bondedBWhale,localTotalBonded, isLoading: isLoadingExtended, refetch}

}

export const fetchBonded = async (client: Wallet, address: string): Promise<BondedInfo> => {
  const result: JsonObject = await client.queryContractSmart(BONDING_CONTRACT_ADDRESS, {
    bonded: {address: address},
  });
  return result as BondedInfo;
};

