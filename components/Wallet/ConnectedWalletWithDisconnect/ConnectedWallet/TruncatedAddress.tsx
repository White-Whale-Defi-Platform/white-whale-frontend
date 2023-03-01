import React from 'react'

import { Text } from '@chakra-ui/react'
import { useConnectedWallet } from '@terra-money/wallet-provider'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { truncate } from 'util/truncate'

function TruncatedAddress({ connected }) {
  const { address } = useRecoilValue(walletState)
  const connectedWallet = useConnectedWallet()

  const truncatWalletAddress = (addr: string) => {
    const chainName = addr?.substring(0, addr.indexOf('1'))
    return connected
      ? `${chainName}${truncate(address, [0, 4])}`
      : `${chainName}${truncate(connectedWallet.walletAddress, [0, 4])}`
  }

  return (
    <Text color="brand.500" fontSize={['14px', '16px']}>
      {connected
        ? truncatWalletAddress(address)
        : truncatWalletAddress(connectedWallet.walletAddress)}
    </Text>
  )
}

export default TruncatedAddress
