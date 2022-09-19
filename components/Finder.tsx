import { ReactNode } from 'react'
import { Link } from '@chakra-ui/react'
import { truncate } from '../libs/text'

type Props = {
    chainId: string;
    txHash: string;
    children?: ReactNode
}

const getUrl = (chainId, txHash) => {

    switch (chainId) {
        case 'uni-3':
            return `https://testnet.mintscan.io/juno-testnet/txs/${txHash}`
            break;
        case 'pisco-1':
            return `https://finder.terra.money/testnet/tx/${txHash}`
            break;
        case 'juno-1':
            return `https://mintscan.io/juno/txs/${txHash}`
            break;
        case 'phoenix-1':
            return `https://finder.terra.money/mainnet/tx/${txHash}`
            break;
        default:
            return null
            break;
    }

}

const Finder = ({ children, txHash, chainId}: Props) => {
    return (
        <Link isExternal href={getUrl(chainId, txHash)} >
            {children} TxHash: {truncate(txHash, [4, 4])}
        </Link>
    )
}

export default Finder