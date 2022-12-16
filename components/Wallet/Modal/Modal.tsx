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
import KeplrConnectButton from 'components/Wallet/Modal/KeplrConnectButton'
// import TerraStationConnectButton from 'components/Wallet/Modal/TerraStationConnectButton'

import LeapConnectButton from './LeapConnectButton'

function WalletModal({ isOpenModal, onCloseModal }) {
  return (
    <Modal isOpen={isOpenModal} onClose={onCloseModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack justify="center" align="center" textAlign="center">
            {/* <TerraStationConnectButton onCloseModal={onCloseModal} /> */}
            <KeplrConnectButton onCloseModal={onCloseModal} />
            <LeapConnectButton onCloseModal={onCloseModal} />
          </VStack>
        </ModalBody>

        {/* <ModalFooter >
            <Button colorScheme='blue' mr={3} onClick={onCloseModal}>
              Close
            </Button>
          </ModalFooter> */}
      </ModalContent>
    </Modal>
  )
}

export default React.memo(WalletModal)
