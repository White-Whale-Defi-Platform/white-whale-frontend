import React, { useCallback } from 'react'

import { Button, HStack, Image, Text } from '@chakra-ui/react'
import KeplrWalletIcon from 'components/icons/KeplrWalletIcon'
import useConnectKeplr from 'hooks/useConnectKeplr'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

function KeplrConnectButton({ onCloseModal }) {
  const { setKeplrAndConnect } = useConnectKeplr()
  const { chainId, activeWallet, network } = useRecoilValue(walletState)

  const setKeplrMemo = useCallback(() => {
    setKeplrAndConnect()
    onCloseModal()
  }, [activeWallet, chainId, network])

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
