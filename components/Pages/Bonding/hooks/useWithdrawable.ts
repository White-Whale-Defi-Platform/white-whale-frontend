import {Wallet} from '../../../../util/wallet-adapters';
import {
  AMP_WHALE_DENOM, B_WHALE_DENOM,
  BONDING_CONTRACT_ADDRESS,
} from '../../../../constants/bonding_contract';
import {JsonObject} from '@cosmjs/cosmwasm-stargate';
import {useQuery} from 'react-query';
import {convertMicroDenomToDenom} from "../../../../util/conversion";
import {DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL} from "../../../../util/constants";

interface WithdrawableInfo {
  withdrawable_amount: number;
}

export const useWithdrawable = (client: Wallet | null, address: string | null) => {
  const {data: withdrawableInfos, isLoading, refetch} = useQuery(
    ['withdrawable', address],
    () => {
      if (client && address) {
        return fetchWithdrawable(client, address);
      } else {
        return Promise.resolve(null);
      }
    },
    {
      refetchIntervalInBackground: true,
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,

    }
  );
  const withdrawableAmpWhale = convertMicroDenomToDenom(withdrawableInfos?.[0]?.withdrawable_amount, 6)

  const withdrawableBWhale = convertMicroDenomToDenom(withdrawableInfos?.[1]?.withdrawable_amount, 6)
  return {withdrawableAmpWhale, withdrawableBWhale, isLoading, refetch};
};

export const fetchWithdrawable = async (
  client: Wallet,
  address: string,
): Promise<WithdrawableInfo[]> => {

  const resultAmp: JsonObject = await client.queryContractSmart(BONDING_CONTRACT_ADDRESS, {
    withdrawable: {address: address, denom: AMP_WHALE_DENOM},
  });
  const resultB: JsonObject = await client.queryContractSmart(BONDING_CONTRACT_ADDRESS, {
    withdrawable: {address: address, denom: B_WHALE_DENOM},
  });
  return [resultAmp, resultB] as WithdrawableInfo[];
};
