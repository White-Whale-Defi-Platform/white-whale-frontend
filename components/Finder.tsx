import { ReactNode } from 'react'

import { Link } from '@chakra-ui/react'

import { truncate } from '../libs/text'

type Props = {
  chainId: string
  txHash: string
  children?: ReactNode
}

const getUrl = (chainId, txHash) => {
  switch (chainId) {
    case 'uni-6':
      return `https://testnet.mintscan.io/juno-testnet/txs/${txHash}`
    case 'migaloo-1':
      return `https://explorer.silknodes.io/migaloo/tx/${txHash}`
    case 'narwhal-1':
      return `https://testnet.migaloo.explorers.guru/transaction/${txHash}`
    case 'pisco-1':
      return `https://finder.terra.money/testnet/tx/${txHash}`
    case 'juno-1':
      return `https://mintscan.io/juno/txs/${txHash}`
    case 'phoenix-1':
      return `https://finder.terra.money/mainnet/tx/${txHash}`
    case 'chihuahua-1':
      return `https://www.mintscan.io/chihuahua/txs/${txHash}`
    case 'injective-888':
      return `https://testnet.explorer.injective.network/transaction/${txHash}`
    case 'injective-1':
      return `https://explorer.injective.network/transaction/${txHash}`
    case 'comdex-1':
      return `https://mintscan.io/comdex/txs/${txHash}`
    case 'pacific-1':
      return `https://ping.pub/sei/tx/${txHash}`
    case 'columbus-5':
      return `https://ping.pub/terra-luna/tx/${txHash}`
    default:
      return null
  }
}

const Finder = ({ children, txHash, chainId }: Props) => {
  console.log({ chainId,
    txHash })
  return (
    <Link isExternal href={getUrl(chainId, txHash)}>
      {children} TxHash: {truncate(txHash, [4, 4])}
    </Link>
  )
}

export default Finder
