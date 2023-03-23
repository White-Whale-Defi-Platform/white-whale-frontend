import {Wallet} from "../../../../util/wallet-adapters";
import {BONDING_CONTRACT_ADDRESS, BONDING_DENOM_TOKEN_MAP} from "../../../../constants/bonding_contract";
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
      console.log("NEW CALL")
      if (client && address) {
        return fetchBonded(client, address);
      } else {
        return Promise.resolve(null);
      }
    },
    {
      refetchIntervalInBackground: true,
    }
  )
  const bondedAmpWhale = convertMicroDenomToDenom(bondedInfo?.bonded_assets.find(asset => asset.info.native_token.denom === "uwhale")?.amount || 0, 6)
  const bondedBWhale = convertMicroDenomToDenom(bondedInfo?.bonded_assets.find(asset => asset.info.native_token.denom === "ibc")?.amount || 0, 6);

  return {bondedAmpWhale, bondedBWhale, isLoading, refetch}

}

export const fetchBonded = async (client: Wallet, address: string): Promise<BondedInfo> => {
  const result: JsonObject = await client.queryContractSmart(BONDING_CONTRACT_ADDRESS, {
    bonded: {address: address},
  });

  return result as BondedInfo;
};

export const getTokenSymbol = (bondedAsset: Asset | null): string | null => {
  if (bondedAsset) {
    return BONDING_DENOM_TOKEN_MAP[bondedAsset.info.native_token.denom];
  }
  return null;
};
