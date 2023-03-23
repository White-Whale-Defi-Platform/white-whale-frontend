import {useCallback} from 'react';
import {Wallet} from "../../../../util/wallet-adapters";
import {FEE_DISTRIBUTOR_CONTRACT_ADDRESS} from "../../../../constants/bonding_contract";
import {TransactionStatus} from "../../../../state/atoms/transactionAtoms";

export const useClaimRewards = (client: Wallet, address: string) => {
  return useCallback(async (): Promise<TransactionStatus> => {
    try {
      const handleMsg = {
        claim: {
        },
      };
      const executeResult = await client.execute(address, FEE_DISTRIBUTOR_CONTRACT_ADDRESS, handleMsg);
      console.log("Execution result:", executeResult);

      // Return successful when result is not null
      if (executeResult) {
        return TransactionStatus.SUCCESSFUL;
      }
      return TransactionStatus.REJECTED;
    } catch (error) {
      console.error('Error during token withdraw:', error);
    }
  }, [client, address]);
};
