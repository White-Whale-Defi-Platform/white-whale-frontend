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
import React from 'react'

import KeplrWallet from './KeplrWallet';
import TerraWallets from './TerraWallets';

function WalletModal({isOpen, onClose}) {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
            <TerraWallets  />
            <KeplrWallet  />
            </VStack>
          </ModalBody>

          <ModalFooter >
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default WalletModal
