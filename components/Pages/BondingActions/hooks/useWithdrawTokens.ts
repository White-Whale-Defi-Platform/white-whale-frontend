import {useCallback} from 'react';
import {Wallet} from "../../../../util/wallet-adapters";
import {BONDING_CONTRACT_ADDRESS} from "../../../../constants/bonding_contract";
import {TransactionStatus} from "../../../../state/atoms/transactionAtoms";

export const useWithdrawTokens = (client: Wallet, address: string) => {
  return useCallback(async (tokenSymbol: string): Promise<TransactionStatus> => {
    try {
      const handleMsg = {
        withdraw: {
          denom: tokenSymbol,
        },
      };
      const executeResult = await client.execute(address, BONDING_CONTRACT_ADDRESS, handleMsg);
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
