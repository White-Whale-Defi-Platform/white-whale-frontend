import React, { useCallback } from 'react'

import { Button, HStack, Text } from '@chakra-ui/react'
import KeplrWalletIcon from 'components/icons/KeplrWalletIcon'
import useConnectKeplr from 'hooks/useConnectKeplr'

function KeplrConnectButton({ onCloseModal }) {
  const { setKeplrAndConnect } = useConnectKeplr()

  const setKeplrMemo = useCallback(() => {
    setKeplrAndConnect()
    onCloseModal()
  }, [onCloseModal, setKeplrAndConnect])

  return (
    <Button variant="wallet" onClick={() => setKeplrMemo()} colorScheme="black">
      <HStack justify="space-between" width="full">
        <Text>Keplr Wallet</Text>
        <KeplrWalletIcon />
      </HStack>
    </Button>
  )
}

export default KeplrConnectButton
