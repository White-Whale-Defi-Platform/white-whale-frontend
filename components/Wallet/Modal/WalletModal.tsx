import React from 'react'
import { isMobile } from 'react-device-detect';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from '@chakra-ui/react'
import { WalletModalProps } from '@cosmos-kit/core'
import WalletConnectButton from 'components/Wallet/Modal/WalletConnectButton'

export enum WalletType {
  keplrExtension = 'keplr-extension',
  keplrMobile = 'keplr-mobile',
  terraExtension = 'station-extension',
  shellExtension = 'shell-extension',
  leapExtension = 'leap-extension',
  leapMobile = 'leap-cosmos-mobile',
  cosmoStationExtension = 'cosmostation-extension',
  cosmoStationMobile = 'cosmostation-mobile',
  leapSnap = 'leap-metamask-cosmos-snap'
}

function WalletModal({ isOpen, setOpen, walletRepo }: WalletModalProps) {
  function onCloseModal() {
    if (isOpen){console.log(isOpen)
    setOpen(false)
    }
  }

  

  return (
    <Modal isOpen={isOpen} onClose={onCloseModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack alignItems="flex-start" width="full" gap={2}>
            {walletRepo?.wallets.map((elem) => {
              const { connect, walletName } = elem;
              if (isMobile && !elem.isModeExtension) {
                return (
                  <WalletConnectButton
                    key={walletName}
                    onCloseModal={onCloseModal}
                    connect={connect}
                    walletType={walletName as WalletType}
                  />
                )
              } else if (!isMobile && elem.isModeExtension){
                return (
                  <WalletConnectButton
                    key={walletName}
                    onCloseModal={onCloseModal}
                    connect={connect}
                    walletType={walletName as WalletType}
                  />
                )
              }
            })}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default React.memo(WalletModal)
