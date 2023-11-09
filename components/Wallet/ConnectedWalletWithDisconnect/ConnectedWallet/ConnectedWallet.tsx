import React from 'react'

import { Button, HStack, useToast } from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import {
  ConnectedWalletIcon,
} from 'components/Wallet/ConnectedWalletWithDisconnect/ConnectedWallet/ConnectedWalletIcon'
import TruncatedAddress from 'components/Wallet/ConnectedWalletWithDisconnect/ConnectedWallet/TruncatedAddress'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

export const ConnectedWallet = () => {
  const toast = useToast()
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address)
      toast({
        title: 'Address copied to clipboard',
        status: 'success',
        duration: 1000,
        position: 'top-right',
        isClosable: true,
      })
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <HStack
      padding="0"
      as={Button}
      variant="unstyled"
      onClick={copyToClipboard}
      width="full"
    >
      <ConnectedWalletIcon />
      <TruncatedAddress/>
    </HStack>
  )
}
