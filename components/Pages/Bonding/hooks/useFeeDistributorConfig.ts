import { Wallet } from '../../../../util/wallet-adapters';
import {FEE_DISTRIBUTOR_CONTRACT_ADDRESS} from '../../../../constants/bonding_contract';
import { JsonObject } from '@cosmjs/cosmwasm-stargate';
import { useQuery } from 'react-query';

interface FeeDistributionConfig {
  owner: string;
  bonding_contract_addr: string;
  fee_collector_addr: string;
  grace_period: string;
  epoch_config: {
    duration: string;
    genesis_epoch: string;
  };
  distribution_asset: {
    native_token: {
      denom: string;
    };
  };
}

export const useFeeDistributorConfig = (client: Wallet | null) => {
  const { data: bondingConfig, isLoading, refetch } = useQuery(
    'feeDistributionConfig',
    () => {
      if (client) {
        return fetchConfig(client);
      } else {
        return Promise.resolve(null);
      }
    },
    {
      retryOnMount:true,
      refetchIntervalInBackground: true,
    }
  );

  return { bondingConfig, isLoading, refetch };
};

export const fetchConfig = async (client: Wallet): Promise<FeeDistributionConfig> => {
  const result: JsonObject = await client.queryContractSmart(FEE_DISTRIBUTOR_CONTRACT_ADDRESS, {
    config: {},
  });

  console.log("FEE DISTR RESULT:")
  console.log(result)

  return result as FeeDistributionConfig;
};
