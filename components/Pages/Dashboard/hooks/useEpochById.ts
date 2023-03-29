import {Wallet} from "../../../../util/wallet-adapters";
import {
  FEE_DISTRIBUTOR_CONTRACT_ADDRESS
} from "../../../../constants/bonding_contract";
import {JsonObject} from "@cosmjs/cosmwasm-stargate";
import {useQuery} from "react-query";

interface EpochData {
  id: string;
  start_time: string;
  total: {
    amount: string;
    info: {
      native_token: {
        denom: string;
      };
    };
  }[];
  available: {
    amount: string;
    info: {
      native_token: {
        denom: string;
      };
    };
  }[];
  claimed: {
    amount: string;
    info: {
      native_token: {
        denom: string;
      };
    };
  }[];
}
interface Epoch {
  epoch: EpochData;
}
export const useEpochById = (client: Wallet | null, id: string ) => {
  const {
    data: currentEpoch,
    isLoading,
    refetch,
  } = useQuery(
    ['currentEpoch', client],
    () => {
      if (client) {
        return fetchEpochById(client, id);
      } else {
        return Promise.resolve(null);
      }
    },
    {
      refetchOnMount:true,

      refetchIntervalInBackground: true,
    }
  )

  return {currentEpoch, isLoading, refetch}

}

export const fetchEpochById = async (client: Wallet, id: string): Promise<Epoch> => {
  const result: JsonObject = await client.queryContractSmart(FEE_DISTRIBUTOR_CONTRACT_ADDRESS, {
    epoch: {id: id},
  });

  return result as Epoch;
};
