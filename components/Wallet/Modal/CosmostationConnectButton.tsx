import React, { useCallback } from 'react'

import { Button, HStack, Text } from '@chakra-ui/react'
import CosmostationWalletIcon from 'components/icons/CosmostationWalletIcon'
import useConnectCosmostation from 'hooks/useConnectCosmostation'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

function CosmostationConnectButton({ onCloseModal }) {
  const { setCosmostationAndConnect } = useConnectCosmostation()
  const { chainId, activeWallet, network } = useRecoilValue(walletState)

  const setCosmostationMemo = useCallback(() => {
    setCosmostationAndConnect()
    onCloseModal()
  }, [activeWallet, chainId, network])

  return (
    <Button variant="wallet" onClick={() => setCosmostationMemo()} colorScheme="black">
      <HStack justify="space-between" width="full">
        <Text>Cosmostation Wallet</Text>
        <CosmostationWalletIcon />
      </HStack>
    </Button>
  )
}

export default CosmostationConnectButton
