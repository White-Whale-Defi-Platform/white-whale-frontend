import React, { useCallback } from 'react'

import { Button, HStack, Text } from '@chakra-ui/react'
import useConnectLeap from 'hooks/useConnectLeap'
import leapWalletIcon from 'public/img/leap-wallet.svg'

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
        <img
          src="/img/leap-wallet.svg"
          alt="leap logo"
          width="24"
          height="24"
        />
      </HStack>
    </Button>
  )
}

export default LeapConnectButton
