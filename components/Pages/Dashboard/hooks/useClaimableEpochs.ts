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
export const useClaimableEpochs= (client: Wallet | null) => {
  const {
    data: data,
    isLoading,
    refetch,
  } = useQuery(
    ['claimableEpochs', client],
    () => {
      if (client) {
        return fetchCurrentEpoch(client);
      } else {
        return Promise.resolve(null);
      }
    },
    {
      refetchOnMount:true,

      refetchIntervalInBackground: true,
    }
  )

  const globalAvailableRewards = convertMicroDenomToDenom(data?.epochs
    .flatMap(e => e.total.map(a => a.amount))
    .reduce((acc, amount) => acc + parseFloat(amount), 0), 6);

  const getLastSevenEpochsAverage = (epochs: Epoch[]): number => {
    const lastSevenEpochs = epochs.slice(-7);
    const totalAmount = lastSevenEpochs
      .flatMap(e => e.total.map(a => a.amount))
      .reduce((acc, amount) => acc + parseFloat(amount), 0);

    return totalAmount / lastSevenEpochs.length;
  };

  const extrapolateAnnualRewards = (dailyAverage: number): number => {
    return convertMicroDenomToDenom(dailyAverage * 365, 6);
  };

  const dailyAverageRewards = data?.epochs ? getLastSevenEpochsAverage(data.epochs) : 0;
  const annualRewards = extrapolateAnnualRewards(dailyAverageRewards);
  const isLoadingExtended = data === null
  return {globalAvailableRewards,annualRewards, isLoading: isLoadingExtended, refetch}
}

export const fetchCurrentEpoch = async (client: Wallet): Promise<Data> => {
  const result: JsonObject = await client.queryContractSmart(FEE_DISTRIBUTOR_CONTRACT_ADDRESS, {
    claimable_epochs: {},
  });
  return result as Data;
};
