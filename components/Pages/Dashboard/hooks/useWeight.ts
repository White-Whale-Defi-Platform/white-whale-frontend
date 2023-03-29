import { Wallet } from '../../../../util/wallet-adapters';
import { BONDING_CONTRACT_ADDRESS } from '../../../../constants/bonding_contract';
import { JsonObject } from '@cosmjs/cosmwasm-stargate';
import { useQuery } from 'react-query';

interface WeightInfo {
  address: string;
  weight: string;
  global_weight: string;
  share: string;
  timestamp: string;
}

export const useWeight = (client: Wallet, address: string) => {
  const { data: weightInfo, isLoading, refetch } = useQuery(
    ['weight', address],
    () => {
      if (client && address) {
        return fetchWeight(client, address);
      } else {
        return Promise.resolve(null);
      }
    },
    {
      refetchOnMount:true,
      refetchIntervalInBackground: true,
    }
  );
  const isLoadingExtended = weightInfo === null
  return { weightInfo, isLoading: isLoadingExtended, refetch };
};

export const fetchWeight = async (
  client: Wallet,
  address: string
): Promise<WeightInfo> => {
  const result: JsonObject = await client.queryContractSmart(BONDING_CONTRACT_ADDRESS, {
    weight: { address: address },
  });

  return result as WeightInfo;
};
