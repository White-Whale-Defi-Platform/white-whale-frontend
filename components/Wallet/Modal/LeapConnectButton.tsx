import React, { useCallback } from 'react'

import { Button, HStack, Text } from '@chakra-ui/react'
import KeplrWalletIcon from 'components/icons/KeplrWalletIcon'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import useConnectLeap from '../../../hooks/useConnectLeap'

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
          src="https://assets.leapwallet.io/leap/cosmos.svg"
          alt="leap logo"
          width="24"
          height="24"
        />
      </HStack>
    </Button>
  )
}

export default LeapConnectButton
