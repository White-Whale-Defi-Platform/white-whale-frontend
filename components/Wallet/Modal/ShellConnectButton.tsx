import React, { useCallback } from 'react'

import { Button, HStack, Text } from '@chakra-ui/react'
import useConnectShell from 'hooks/useConnectShell'

import ShellWalletIcon from '../../icons/ShellWalletIcon'

function ShellConnectButton({ onCloseModal }) {
  const { setShellAndConnect } = useConnectShell()

  const setShellMemo = useCallback(() => {
    setShellAndConnect()
    onCloseModal()
  }, [onCloseModal, setShellAndConnect])

  return (
    <Button variant="wallet" onClick={() => setShellMemo()} colorScheme="black">
      <HStack justify="space-between" width="full">
        <Text>Shell Wallet</Text>
        <ShellWalletIcon />
      </HStack>
    </Button>
  )
}

export default ShellConnectButton
