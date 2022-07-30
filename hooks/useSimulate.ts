import { useMemo } from "react";
import { useQuery } from 'react-query';
import { toAsset } from "./asset";
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { SimulationResponse, ReverseSimulationResponse } from "hooks/types";

type QuerySimulate = {
    client: SigningCosmWasmClient;
    token: string;
    amount: string;
    reverse: boolean;
    swapAddress: string;
}

type SwapSimulate = {
    client: SigningCosmWasmClient;
    token: string;
    amount: string;
    reverse: boolean;
    swapAddress: string;
    enabled: boolean;
}

const simulate = ({
    client,
    token,
    amount,
    reverse = false,
    swapAddress
}: QuerySimulate): Promise<SimulationResponse | ReverseSimulationResponse> => {

    if (reverse) {
        return client?.queryContractSmart(swapAddress, {
            reverse_simulation: {
                ask_asset: toAsset({ token, amount }),
            },
        });
    }

    return client?.queryContractSmart(swapAddress, {
        simulation: {
            offer_asset: toAsset({ token, amount }),
        }
    })
};

const useSimulate = ({
    client,
    token,
    amount,
    reverse = false,
    swapAddress,
    enabled
}: SwapSimulate) => {

    const { data, isLoading } = useQuery<any>(["simulation", token, amount, reverse], () => {
        if (token == null || amount == '') return

        return simulate({
            client,
            token,
            amount,
            reverse,
            swapAddress
        });
    },
        {
            enabled: !!client && amount?.length > 0 && enabled,
            onError: (err) => console.log(err)
        },
    );

    return useMemo(() => {
        if (data == null || amount == '') {
            return null;
        }

        const spread = data.spread_amount;
        const commission = data.commission_amount;


        if (reverse) {
            return {
                amount: data.offer_amount,
                spread,
                commission,
                price: Number(data.offer_amount) / Number(amount)
            };
        }

        return {
            amount: data.return_amount,
            spread,
            commission,
            price: Number(amount) / Number(data.return_amount)
        };
    }, [amount, data, isLoading]);


}

export default useSimulate