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
              <TerraWallets onCloseModal={onCloseModal}  />
              <KeplrWallet onCloseModal={onCloseModal} />
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
