import {Wallet} from '../../../../util/wallet-adapters';
import {BONDING_CONTRACT_ADDRESS} from '../../../../constants/bonding_contract';
import {coin} from '@cosmjs/stargate'

export const useBondTokens = async (client: Wallet, address: string, amount: number, denom: string) => {

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
        return client.execute(address, BONDING_CONTRACT_ADDRESS, handleMsg, [coin(amount, denom)]);

}

