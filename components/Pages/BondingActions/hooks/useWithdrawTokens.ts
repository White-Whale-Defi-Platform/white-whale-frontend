import {Wallet} from "../../../../util/wallet-adapters";
import {BONDING_CONTRACT_ADDRESS} from "../../../../constants/bonding_contract";

export const useWithdrawTokens = (client: Wallet, address: string, denom: string) => {
  const handleMsg = {
    withdraw: {
      denom: denom,
    },
  };
  return client.execute(address, BONDING_CONTRACT_ADDRESS, handleMsg);

}
