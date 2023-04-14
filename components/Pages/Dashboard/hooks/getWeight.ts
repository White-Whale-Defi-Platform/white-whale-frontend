import { Wallet } from 'util/wallet-adapters';
import { JsonObject } from '@cosmjs/cosmwasm-stargate';
import {Config} from "./useDashboardData";

export interface WeightInfo {
  address: string;
  weight: string;
  global_weight: string;
  share: string;
  timestamp: string;
}

export const getWeight = async (client: Wallet, address: string, config: Config) => {
  if (!client || !address) {
    return null;
  }

  const weightInfo = await fetchWeight(client, address,config);

  return { weightInfo };
};

const fetchWeight = async (
  client: Wallet,
  address: string,
  config: Config,
): Promise<WeightInfo> => {
  const result: JsonObject = await client.queryContractSmart(config.whale_lair_address, {
    weight: { address: address },
  });

  return result as WeightInfo;
};
