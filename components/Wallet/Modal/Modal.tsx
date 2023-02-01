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
import KeplrConnectButton from './KeplrConnectButton'
import CosmostationConnectButton from './CosmostationConnectButton'
import TerraStationConnectButton from './TerraStationConnectButton'
import LeapConnectButton from './LeapConnectButton'

function WalletModal({ isOpenModal, onCloseModal, chainId }) {
  return (
    <Modal isOpen={isOpenModal} onClose={onCloseModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack justify="center" align="center" textAlign="center">
            {(chainId !== 'comdex-1' && chainId !== 'injective-1') && (
              <TerraStationConnectButton onCloseModal={onCloseModal} />
            )}
            <KeplrConnectButton onCloseModal={onCloseModal} />
            <LeapConnectButton onCloseModal={onCloseModal} />
            <CosmostationConnectButton onCloseModal={onCloseModal} />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default React.memo(WalletModal)
