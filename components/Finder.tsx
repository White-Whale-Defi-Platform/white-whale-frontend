import React from 'react'
import { Text, Link } from '@chakra-ui/react'
import { truncate } from '../libs/text'

type Props = {
    chainId: string;
    from: string;
    to: string;
    txHash: string
}

const getUrl = (chainId, txHash) => {

    switch (chainId) {
        case 'uni-3':
            return `https://testnet.mintscan.io/juno-testnet/txs/${txHash}`
            break;
        case 'pisco-1':
            return `https://finder.terra.money/testnet/tx/${txHash}`
            break;
        default:
            return null
            break;
    }

}

const Finder = ({ from, to, txHash, chainId }: Props) => {
    return (
        <Link isExternal href={getUrl(chainId, txHash)} > {from} to {to} {truncate(txHash, [4, 4])} </Link>
    )
}

export default Finder