import { useMultipleTokenBalance } from 'hooks/useTokenBalance'
import { useMemo, useState } from 'react';

export interface Asset {
    asset: string;
    contract: string,
    icon?: string,
    amount?: string | number,
    balance?: number
    id?: string;
    chain_id?: string;
    symbol?: string;
    decimals?: number;
    tags?: string[];
    native?: boolean;
    denom?: string;
}

const assets = [
    {
        asset: "JUNOX",
        name: "JUNOX",
        contract: "ujunox",
        logoURI: "/juno.svg",
        amount: '',
        symbol:"JUNOX",
        balance: 0,
    },
    {
        asset: "JUNOONE",
        name: "JUNOONE",
        contract: "juno1zvg8qf0acgpcmeugmw3qsggrr02tzsfg5ca7avv5r2fekpfta68q3q939g",
        logoURI: "/junoone.svg",
        amount: '',
        symbol:"JUNOONE",
        balance: 0,
    },
    {
        asset: "JUNOTWO",
        name: "JUNOTWO",
        logoURI: "/junotwo.svg",
        contract: "juno1ey3fsj3gzax0ss24vtj0pmcg6vvf532gtffkecx5e09dn8uqfstqg8xake",
        amount: '',
        symbol:"JUNOTWO",
        balance: 0,
    }
]

interface Props {
    list? : string[],
    skip? : string
}

const useAsset = ({list = [], skip = ''}: Props = {}) => {

    const assetByName = assets.map(({asset}) => asset)
    const [withBalance] = useMultipleTokenBalance(assetByName)
    
    const assetWithBalance = useMemo(() => {
        if(!withBalance) return assets

        return withBalance
    },[withBalance])



    if (!list.length) return assetWithBalance.filter(({name}) => name !== skip)

    return assetWithBalance.filter(({ symbol, name }: any) => list.includes(symbol) || list.includes(name))
}

export default useAsset