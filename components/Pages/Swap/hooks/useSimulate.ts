import { useMemo } from "react";
import { useQuery } from 'react-query';

import {Wallet} from "../../../../util/wallet-adapters";

type QuerySimulate = {
    client: Wallet;
    token: string;
    isNative: boolean;
    amount: string;
    reverse: boolean;
    swapAddress: string;
}

type SwapSimulate = {
    client: Wallet;
    token: string;
    isNative: boolean;
    amount: string;
    reverse: boolean;
    swapAddress: string;
    enabled: boolean;
}

export type Simulated = {
    amount: string;
    spread: string;
    commission: string;
    price: number;
    error?: string
}


const simulate = ({ client, msg, routerAddress }): Promise<any> => {
    return client?.queryContractSmart(routerAddress, msg)
};

const useSimulate = ({ client, msg, routerAddress }) => {

    const { data, isLoading, error } = useQuery<any>(["simulation", msg], () => {
        if (msg == null) return

        return simulate({ client, msg, routerAddress });
    },
        {
            enabled: !!client && !!msg,
            // onError: (err) => {
            //     console.log({err : (err as any)?.code})
            // }
        },
    );

    const simulatedError = useMemo(() => {
        if (!error) return null

        if (/unreachable: query wasm contract failed: invalid request/i.test(error?.toString()) || /codespace: wasm, code: 9: query wasm/i.test(error?.toString()))
            return "Insuifficient liquidity"

    }, [error])

    return {
        simulated: data,
        error: simulatedError,
        isLoading
    }

}

export default useSimulate
