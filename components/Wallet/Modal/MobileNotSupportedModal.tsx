import React from 'react'

import {
  Image,
  Link,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react'

function MobileNotSupportedModal() {
  return (
    <Modal isOpen={true} onClose={() => {}} isCentered>
      <ModalOverlay />
      <ModalContent border="1px" borderColor="gray.200" padding="1" margin="4">
        <ModalHeader>
          <VStack>
            <Text>Currently, only Leap's in-app browser is supported on mobile.</Text>
            <Link href="https://www.leapwallet.io/" isExternal>
              <Image flex={'1'} maxBlockSize={'10'} src="https://assets-global.website-files.com/63af9e8fb337a641e2075c4f/63afa06f10dd572ce7252901_logo.svg" alt="Leap Logo" />
            </Link>
            <Link href="https://play.google.com/store/apps/details?id=io.leapwallet.cosmos&utm_source=website&utm_medium=permanent-website&utm_campaign=permanent" isExternal>
              <Image flex={'1'} maxBlockSize={'10'} src="https://assets-global.website-files.com/63af9e8fb337a641e2075c4f/63f7ac8b92f9f9c3bea96e10_Google_Play_Store_badge_EN.svg" alt="Google Play Store Badge" />
            </Link>
            <Link href="https://apps.apple.com/in/app/leap-cosmos/id1642465549/?utm_source=website&utm_medium=permanent-website&utm_campaign=permanent" isExternal>
              <Image flex={'1'} maxBlockSize={'10'} src="https://assets-global.website-files.com/63af9e8fb337a641e2075c4f/63f7acd2acfc21f24c483fd9_appstroe.svg" alt="AppStore Badge" />
            </Link></VStack>
        </ModalHeader>
      </ModalContent>
    </Modal>
  )
}

export default React.memo(MobileNotSupportedModal)
