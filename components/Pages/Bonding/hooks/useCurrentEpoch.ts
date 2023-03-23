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
export const useCurrentEpoch = (client: Wallet | null) => {
  const {
    data: currentEpoch,
    isLoading,
    refetch,
  } = useQuery(
    ['currentEpoch', client],
    () => {
      if (client) {
        return fetchCurrentEpoch(client);
      } else {
        return Promise.resolve(null);
      }
    },
    {
      refetchIntervalInBackground: true,
    }
  )

  return {currentEpoch, isLoading, refetch}

}

export const fetchCurrentEpoch = async (client: Wallet): Promise<Epoch> => {
  const result: JsonObject = await client.queryContractSmart(FEE_DISTRIBUTOR_CONTRACT_ADDRESS, {
    current_epoch: {},
  });

  return result as Epoch;
};
