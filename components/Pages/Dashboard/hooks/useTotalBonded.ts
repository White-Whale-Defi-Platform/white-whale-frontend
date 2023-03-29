import {Wallet} from "../../../../util/wallet-adapters";
import {
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

interface TotalBondedInfo {
  bonded_assets: Asset[];
  total_bonded: string;
}

export const useTotalBonded = (client: Wallet | null) => {
  const {
    data: totalBondedInfo,
    isLoading,
    refetch,
  } = useQuery(
    ['totalBonded', client],
    () => {
      if (client) {
        return fetchTotalBonded(client);
      } else {
        return Promise.resolve(null);
      }
    },
    {
      refetchOnMount:true,
      refetchIntervalInBackground: true,
    }
  )

  const globalTotalBonded = convertMicroDenomToDenom(totalBondedInfo?.total_bonded || 0, 6)
  const isLoadingExtended = totalBondedInfo === null
  return {globalTotalBonded, isLoading: isLoadingExtended, refetch}

}

export const fetchTotalBonded = async (client: Wallet): Promise<TotalBondedInfo> => {
  const result: JsonObject = await client.queryContractSmart(BONDING_CONTRACT_ADDRESS, {
    total_bonded: {},
  });
  return result as TotalBondedInfo;
};

