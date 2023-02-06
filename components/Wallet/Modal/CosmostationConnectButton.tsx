import React, { useCallback } from 'react'

import { Button, HStack, Text } from '@chakra-ui/react'
import CosmostationWalletIcon from 'components/icons/CosmostationWalletIcon'
import useConnectCosmostation from 'hooks/useConnectCosmostation'

function CosmostationConnectButton({ onCloseModal }) {
  const { setCosmostationAndConnect } = useConnectCosmostation()

  const setCosmostationMemo = useCallback(() => {
    setCosmostationAndConnect()
    onCloseModal()
  }, [onCloseModal, setCosmostationAndConnect])

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
