import React from 'react'

import { Text } from '@chakra-ui/react'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/atoms/chainState'
import { truncate } from 'util/truncate'
import { useChain } from '@cosmos-kit/react-lite'

function TruncatedAddress({ connected }) {
  const { chainName } = useRecoilValue(chainState)

  const { address } = useChain(chainName)

  const truncatedWalletAddress = (addr: string) => {
    const chainName = addr?.substring(0, addr.indexOf('1'))
    return connected
      ? `${chainName}${truncate(address, [0, 4])}`
      : `${chainName}${truncate(address, [0, 4])}`
  }

  return (
    <Text color="brand.500" fontSize={['14px', '16px']}>
      {connected
        ? truncatedWalletAddress(address)
        : truncatedWalletAddress(address)}
    </Text>
  )
}

export default TruncatedAddress
