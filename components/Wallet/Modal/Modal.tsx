import React from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack
} from '@chakra-ui/react'

import TerraStationConnectButton from 'components/Wallet/Modal/TerraStationConnectButton';
import KeplrConnectButton from 'components/Wallet/Modal/KeplrConnectButton';

function WalletModal({ isOpenModal, onCloseModal}) {
  return (
    <>
      <Modal isOpen={isOpenModal} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <TerraStationConnectButton onCloseModal={onCloseModal}  />
              <KeplrConnectButton onCloseModal={onCloseModal} />
            </VStack>
          </ModalBody>

          <ModalFooter >
            <Button colorScheme='blue' mr={3} onClick={onCloseModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default React.memo(WalletModal)
