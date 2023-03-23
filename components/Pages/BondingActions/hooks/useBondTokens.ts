import {useCallback} from 'react';
import {Wallet} from '../../../../util/wallet-adapters';
import {BONDING_CONTRACT_ADDRESS} from '../../../../constants/bonding_contract';
import {coin} from '@cosmjs/stargate'
import {TransactionStatus} from "../../../../state/atoms/transactionAtoms";

export const useBondTokens = (client: Wallet, address: string) => {
  return useCallback(
    async (denom: string, amount: number): Promise<TransactionStatus> => {
      try {
        const handleMsg = {
          bond: {
            asset: {
              amount: amount.toString(),
              info: {
                native_token: {
                  denom: denom,
                },
              },
            },
          },
        };
        const executeResult = await client.execute(address, BONDING_CONTRACT_ADDRESS, handleMsg, [coin(amount, denom)]);
        console.log('Execution result:', executeResult);
        // Return successful when result is not null
        if (executeResult) {
          return TransactionStatus.SUCCESSFUL;
        }
        return TransactionStatus.REJECTED;
      } catch (error) {
        console.error('Error during token bonding:', error);
        return TransactionStatus.REJECTED;
      }
    },
    [client, address]
  );
};

