import React from 'react'

import {
  HStack,
  Image,
  Link,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react'

const MobileNotSupportedModal = () => (
  <Modal isOpen={true} isCentered onClose={null}>
    <ModalOverlay />
    <ModalContent border="1px" borderColor="gray.200" padding="1" margin="4">
      <ModalHeader>
        <Text>Currently, only Leaps and Keplrs in-app browser are supported on mobile.</Text>
        <HStack align={'center'} pl={'20%'} spacing={'5'}>
          <Link href="https://www.leapwallet.io/" isExternal>
            <Image flex={'1'} maxBlockSize={'40px'} src="https://assets-global.website-files.com/63af9e8fb337a641e2075c4f/63afa06f10dd572ce7252901_logo.svg" alt="Leap Logo" />
          </Link>
          <Link href="https://www.keplr.app/download" isExternal>
            <Image flex={'1'} maxBlockSize={'30px'} src="https://assets-global.website-files.com/63eb7ddf41cf5b1c8fdfbc74/63edd5d1a40b9a48841ac1d2_Keplr%20Logo.svg" alt="Keplr Logo" />
          </Link>
        </HStack>
      </ModalHeader>
    </ModalContent>
  </Modal>
)

export default React.memo(MobileNotSupportedModal)
