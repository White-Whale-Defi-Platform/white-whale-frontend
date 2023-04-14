import {Wallet} from "util/wallet-adapters";
import {Config} from "components/Pages/Dashboard/hooks/useDashboardData";

export const claimRewards = (client: Wallet, address: string, config: Config) => {
      const handleMsg = {
        claim: {
        },
      };
      return  client.execute(address, config.fee_distributor_address, handleMsg);
};
