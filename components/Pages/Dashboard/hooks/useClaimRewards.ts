import {Wallet} from "../../../../util/wallet-adapters";
import {FEE_DISTRIBUTOR_CONTRACT_ADDRESS} from "../../../../constants/bonding_contract";

export const useClaimRewards = (client: Wallet, address: string) => {
      const handleMsg = {
        claim: {
        },
      };
      return  client.execute(address, FEE_DISTRIBUTOR_CONTRACT_ADDRESS, handleMsg);
};
