import React, { useCallback } from 'react'

import { Button, HStack, Text } from '@chakra-ui/react'
import useConnectLeap from 'hooks/useConnectLeap'
import LeapWalletIcon from 'components/icons/LeapWalletIcon'

function LeapConnectButton({ onCloseModal }) {
  const { setLeapAndConnect } = useConnectLeap()

  const setLeapMemo = useCallback(() => {
    setLeapAndConnect()
    onCloseModal()
  }, [onCloseModal, setLeapAndConnect])

  return (
    <Button variant="wallet" onClick={() => setLeapMemo()} colorScheme="black">
      <HStack justify="space-between" width="full">
        <Text>Leap Wallet</Text>
        <LeapWalletIcon />
      </HStack>
    </Button>
  )
}

export default LeapConnectButton
