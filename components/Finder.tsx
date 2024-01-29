import { ReactNode } from 'react'

import { Link, VStack, Text } from '@chakra-ui/react'
import { ChainId } from 'constants/index'
import { truncate } from 'libs/text'

type Props = {
  chainId: string
  txHash: string
  children?: ReactNode
}

const getUrl = (chainId: string, txHash: string) => {
  switch (chainId) {
    case 'uni-6':
      return `https://testnet.mintscan.io/juno-testnet/txs/${txHash}`
    case ChainId.migaloo:
      return `https://explorer.kjnodes.com/migaloo/tx/${txHash}`
    case ChainId.narwhal:
      return `https://testnet.migaloo.explorers.guru/transaction/${txHash}`
    case ChainId.pisco:
      return `https://finder.terra.money/testnet/tx/${txHash}`
    case ChainId.juno:
      return `https://mintscan.io/juno/txs/${txHash}`
    case ChainId.terra:
      return `https://finder.terra.money/mainnet/tx/${txHash}`
    case ChainId.chihuahua:
      return `https://www.mintscan.io/chihuahua/txs/${txHash}`
    case 'injective-888':
      return `https://testnet.explorer.injective.network/transaction/${txHash}`
    case ChainId.injective:
      return `https://explorer.injective.network/transaction/${txHash}`
    case ChainId.comdex:
      return `https://mintscan.io/comdex/txs/${txHash}`
    case ChainId.sei:
      return `https://ping.pub/sei/tx/${txHash}`
    case ChainId.terrac:
      return `https://ping.pub/terra-luna/tx/${txHash}`
    case ChainId.osmosis:
      return `https://mintscan.io/osmosis/txs/${txHash}`
    default:
      return null
  }
}

const Finder = ({ children, txHash, chainId }: Props) => {
  if (chainId === ChainId.injective) {
    return (<VStack align={'start'} alignItems={'start'}>
      <Text>Secret Word😱: matrix </Text>
      <Link isExternal href={getUrl(chainId, txHash)}>
        {children} TxHash:{truncate(txHash, [4, 4])}
      </Link>
    </VStack>
    )
  } else {
    return (
      <Link isExternal href={getUrl(chainId, txHash)}>
        {children} TxHash:{truncate(txHash, [4, 4])}
      </Link>
    )
  }
}

export default Finder
