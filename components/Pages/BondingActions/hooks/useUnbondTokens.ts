import {useCallback} from 'react';
import {Wallet} from "../../../../util/wallet-adapters";
import {BONDING_CONTRACT_ADDRESS} from "../../../../constants/bonding_contract";
import {TransactionStatus} from "../../../../state/atoms/transactionAtoms";

export const useUnbondTokens = (client: Wallet, address: string) => {
  return useCallback(async (tokenSymbol: string, amount: number): Promise<TransactionStatus> => {
    try {
      const handleMsg = {
        unbond: {
          asset: {
            amount: amount.toString(),
            info: {
              native_token: {
                denom: tokenSymbol,
              },
            },
          },
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
      console.error('Error during token unbonding:', error);
    }

  }, [client, address]);
};
