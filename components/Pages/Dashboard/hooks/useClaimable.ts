import {Wallet} from "../../../../util/wallet-adapters";
import {
  FEE_DISTRIBUTOR_CONTRACT_ADDRESS
} from "../../../../constants/bonding_contract";
import {JsonObject} from "@cosmjs/cosmwasm-stargate";
import {useQuery} from "react-query";
import {convertMicroDenomToDenom} from "../../../../util/conversion";

interface Epoch {
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
interface Data {
  epochs: Epoch[];
}
export const useClaimable= (client: Wallet | null, address: string | null) => {
  const {
    data: data,
    isLoading,
    refetch,
  } = useQuery(
    ['claimable', client],
    () => {
      if (client) {
        return fetchCurrentEpoch(client, address);
      } else {
        return Promise.resolve(null);
      }
    },
    {
      refetchOnMount:true,

      refetchIntervalInBackground: true,
    }
  )

  const claimable = convertMicroDenomToDenom(data?.epochs
    .flatMap(e => e.available.map(a => a.amount))
    .reduce((acc, amount) => acc + parseFloat(amount), 0), 6);
  const isLoadingExtended = data === null
  return {claimable, isLoading: isLoadingExtended, refetch}

}

export const fetchCurrentEpoch = async (client: Wallet, address: string): Promise<Data> => {
  const result: JsonObject = await client.queryContractSmart(FEE_DISTRIBUTOR_CONTRACT_ADDRESS, {
    claimable: {address: address},
  });

  return result as Data;
};
