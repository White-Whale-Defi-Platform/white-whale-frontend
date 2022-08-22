import { ReactNode } from 'react'
import { Text, Link, VStack} from '@chakra-ui/react'
import { truncate } from '../libs/text'
import { networkAtom } from 'state/atoms/walletAtoms'
import { useRecoilValue } from 'recoil'


type Props = {
    chainId: string;
    txHash: string;
    children?: ReactNode
}

const getUrl = (chainId, txHash, network) => {

    switch (chainId) {
        case 'uni-3':
            return `https://${network === 'testnet' && "testnet."}mintscan.io/juno-testnet/txs/${txHash}`
            break;
        case 'pisco-1':
            return `https://finder.terra.money/${network === 'testnet' && "testnet/"}tx/${txHash}`
            break;
        default:
            return null
            break;
    }

}

const Finder = ({ children, txHash, chainId }: Props) => {
    const network = useRecoilValue(networkAtom)
    return (
        <Link isExternal href={getUrl(chainId, txHash, network)} >
            {children} TxHash: {truncate(txHash, [4, 4])}
        </Link>
    )
}

export default Finder