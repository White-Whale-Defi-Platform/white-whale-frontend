import { Wallet } from '../../../../util/wallet-adapters';
import { BONDING_CONTRACT_ADDRESS } from '../../../../constants/bonding_contract';
import { JsonObject } from '@cosmjs/cosmwasm-stargate';
import { useQuery } from 'react-query';

interface NativeToken {
  denom: string;
}

interface BondingAsset {
  native_token: NativeToken;
}

interface BondingConfig {
  owner: string;
  unbonding_period: number;
  growth_rate: string;
  bonding_assets: BondingAsset[];
}

export const useBondingConfig = (client: Wallet | null) => {
  const { data: bondingConfig, isLoading, refetch } = useQuery(
    'bondingConfig',
    () => {
      if (client) {
        return fetchConfig(client);
      } else {
        return Promise.resolve(null);
      }
    },
    {
      refetchOnMount:true,
      refetchIntervalInBackground: true,
    }
  );
  const isLoadingExtended = bondingConfig === null
  return { bondingConfig, isLoading: isLoadingExtended, refetch };
};

export const fetchConfig = async (client: Wallet): Promise<BondingConfig> => {
  const result: JsonObject = await client.queryContractSmart(BONDING_CONTRACT_ADDRESS, {
    config: {},
  });

  return result as BondingConfig;
};
