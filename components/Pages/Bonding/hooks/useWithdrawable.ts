import {Wallet} from '../../../../util/wallet-adapters';
import {BONDING_CONTRACT_ADDRESS} from '../../../../constants/bonding_contract';
import {JsonObject} from '@cosmjs/cosmwasm-stargate';
import {useQuery} from 'react-query';
import {convertMicroDenomToDenom} from "../../../../util/conversion";

interface WithdrawableInfo {
  withdrawable_amount: number;
}

export const useWithdrawable = (client: Wallet | null, address: string | null, denoms: string[] | null) => {
  const {data: withdrawableInfos, isLoading, refetch} = useQuery(
    ['withdrawable', address, denoms],
    () => {
      if (client && address && denoms) {
        return fetchWithdrawable(client, address, denoms);
      } else {
        return Promise.resolve(null);
      }
    },
    {
      refetchIntervalInBackground: true,
    }
  );
    const withdrawableAmpWhale = convertMicroDenomToDenom(withdrawableInfos?.[0]?.withdrawable_amount, 6)

  const withdrawableBWhale= convertMicroDenomToDenom(withdrawableInfos?.[1]?.withdrawable_amount, 6)
  return {withdrawableAmpWhale, withdrawableBWhale, isLoading, refetch};
};

export const fetchWithdrawable = async (
  client: Wallet,
  address: string,
  denoms: string[]
): Promise<WithdrawableInfo[]> => {

  const resultAmp: JsonObject = await client.queryContractSmart(BONDING_CONTRACT_ADDRESS, {
    withdrawable: {address: address, denom: denoms[0]},
  });
  const resultB: JsonObject = await client.queryContractSmart(BONDING_CONTRACT_ADDRESS, {
    withdrawable: {address: address, denom: denoms[1]},
  });
  return [resultAmp, resultB ]as WithdrawableInfo[];
};
