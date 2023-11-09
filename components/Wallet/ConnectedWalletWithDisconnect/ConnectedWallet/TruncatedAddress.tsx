import React from 'react'

import { Text } from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { truncate } from 'util/truncate'

export const TruncatedAddress = () => {
  const { walletChainName } = useRecoilValue(chainState)

  const { address } = useChain(walletChainName)

  const truncatedWalletAddress = (addr: string) => {
    const chainName = addr?.substring(0, addr.indexOf('1'))
    return `${chainName}${truncate(address, [0, 4])}`
  }

  return (
    <Text color="brand.500" fontSize={['14px', '16px']}>
      {truncatedWalletAddress(address)}
    </Text>
  )
}

export default TruncatedAddress
