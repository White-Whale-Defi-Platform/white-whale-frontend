import React from 'react'

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from '@chakra-ui/react'

import WalletConnectButton from 'components/Wallet/Modal/WalletConnectButton'
import { WalletModalProps } from '@cosmos-kit/core'

export enum WalletType {
  keplrExtension = 'keplr-extension',
  keplrMobile = 'keplr-mobile',
  terraExtension = 'station-extension',
  shellExtension = 'shell-extension',
  leapExtension = 'leap-extension',
  leapMobile = 'leap-cosmos-mobile',
  cosmoStationExtension = 'cosmostation-extension',
  cosmoStationMobile = 'cosmostation-mobile',
}

function WalletModal({ isOpen, setOpen, walletRepo }: WalletModalProps) {
  function onCloseModal() {
    setOpen(false)
  }
  return (
    <Modal isOpen={isOpen} onClose={onCloseModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack alignItems="flex-start" width="full" gap={2}>
            {walletRepo?.wallets.map(({ walletName, connect }) => (
              <WalletConnectButton
                key={walletName}
                onCloseModal={onCloseModal}
                connect={connect}
                walletType={walletName as WalletType}
              />
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default React.memo(WalletModal)
