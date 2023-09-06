import React, { useCallback } from 'react'

import { Button, HStack, Image, Text } from '@chakra-ui/react'
import KeplrWalletIcon from 'components/icons/KeplrWalletIcon'
import { WalletType } from 'components/Wallet/Modal/WalletModal'
import LeapWalletIcon from 'components/icons/LeapWalletIcon'
import CosmostationWalletIcon from 'components/icons/CosmostationWalletIcon'

interface Props {
  onCloseModal: () => void
  walletType?: WalletType
  connect?: () => void
}

function WalletConnectButton({ onCloseModal, connect, walletType }: Props) {
  const setWallet = useCallback(() => {
    connect()
    onCloseModal()
  }, [onCloseModal, connect])

  const renderContent = () => {
    switch (walletType) {
      case WalletType.keplrExtension:
        return 'Keplr Wallet'
      case WalletType.keplrMobile:
        return 'Keplr Wallet (mobile)'
      case WalletType.terraExtension:
        return 'Terra Station'
      case WalletType.cosmoStationExtension:
        return 'Cosmostation'
      case WalletType.cosmoStationMobile:
        return 'Cosmostation (mobile)'
      case WalletType.shellExtension:
        return 'Shell Wallet'
      case WalletType.leapExtension:
        return 'Leap Wallet'
      case WalletType.leapMobile:
        return 'Leap Wallet (mobile)'
      default:
        // return a default component or null if walletName does not match any type
        return null
    }
  }

  const walletConnectIcon = (
    <Image
      src={'/logos/wallet-connect-icon.png'}
      width="auto"
      maxW="1.5rem"
      maxH="1.5rem"
      alt="token1-img"
    />
  )

  const renderIcon = () => {
    switch (walletType) {
      case WalletType.keplrExtension:
        return <KeplrWalletIcon />
      case WalletType.keplrMobile:
        return walletConnectIcon
      case WalletType.terraExtension:
        return <img src="/logos/station-icon.png" width={'27px'} />
      case WalletType.cosmoStationExtension:
        return <CosmostationWalletIcon />
      case WalletType.cosmoStationMobile:
        return walletConnectIcon
      case WalletType.shellExtension:
        return <img src="/logos/shell-icon.png" width={'27px'} />
      case WalletType.leapExtension:
        return <LeapWalletIcon />
      case WalletType.leapMobile:
        return walletConnectIcon
      default:
        return null
    }
  }

  return (
    <Button variant="wallet" onClick={() => setWallet()} colorScheme="black">
      <HStack justify="space-between" width="full">
        <Text>{renderContent()}</Text>
        {renderIcon()}
      </HStack>
    </Button>
  )
}

export default WalletConnectButton