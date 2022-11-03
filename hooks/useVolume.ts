import { useMemo } from "react";
import { request, gql } from "graphql-request";
import { useQuery } from "react-query";
import dayjs from "dayjs";

import { GRAPHQL_URL } from "util/constants";
import { fromChainAmount, num } from "libs/num";
import { useChainInfo } from 'hooks/useChainInfo'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

const query = gql`
    query($filter: TradingVolumeFilter){
        tradingVolumes(
            first:1, 
            filter : $filter
        )
        {
            nodes{
                id
                datetime 
                pair 
                cumulativeLiquidity
                tradingVolume
            }
        }
    }
`;

export const useVolume = ({ pair, datetime }) => {
    const currentWalletState = useRecoilValue(walletState)
    const [activeChain]: any = useChainInfo(currentWalletState.chainId)

    const filter = {
        pair: {
            equalTo: pair
        },
        datetime: {
            equalTo: datetime
        }
    }

    const { data, isLoading } = useQuery(['volume', pair, datetime],
        () => request(activeChain?.indexerUrl, query, { filter }),
        { enabled: !!activeChain?.indexerUrl }
    );

    const volume = useMemo(() => {
        if (data == null) {
            return [];
        }

        const [volume] = data?.tradingVolumes?.nodes

        return num(fromChainAmount(volume?.tradingVolume || 0)).toFixed(10)
    }, [data]);

    return { volume, isLoading }
};

export default useVolume;
