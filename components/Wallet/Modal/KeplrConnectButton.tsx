import { Button, HStack, Text, Image } from '@chakra-ui/react'
import React, { useCallback } from 'react'
import { useRecoilValue } from 'recoil'

import useConnectKeplr from 'hooks/useConnectKeplr'
import { walletState } from 'state/atoms/walletAtoms'
import KeplrWalletIcon from 'components/icons/KeplrWalletIcon'

function KeplrConnectButton({ onCloseModal }) {
  const { setKeplrAndConnect } = useConnectKeplr()
  const { chainId, activeWallet, network, } = useRecoilValue(walletState)

  const setKeplrMemo = useCallback(() => {
    setKeplrAndConnect()
    onCloseModal()
  }, [activeWallet, chainId, network])

  return (
    <Button
      variant="wallet"
      onClick={() => setKeplrMemo()} colorScheme="black">
      <HStack justify="space-between" width="full">
        <Text>Keplr Wallet</Text>
        <KeplrWalletIcon />
      </HStack>
    </Button>
  )
}


export default KeplrConnectButton
