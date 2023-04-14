import {Wallet} from "util/wallet-adapters";
import {Config} from "components/Pages/Dashboard/hooks/useDashboardData";

export const withdrawTokens = (client: Wallet, address: string, denom: string, config: Config) => {
  const handleMsg = {
    withdraw: {
      denom: denom,
    },
  };
  return client.execute(address, config.whale_lair_address, handleMsg);

}
