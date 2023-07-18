import { FC, ReactNode } from 'react'
import { isMobile } from 'react-device-detect'

import { Flex } from '@chakra-ui/react'
import Navbar from 'components/Navbar'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import Status from '../Status'
import RadialGradient from './RadialGradient'

const AppLayout: FC<ReactNode> = ({ children }) => {
  const { chainId } = useRecoilValue(walletState)
  return (
    <>
        <Flex direction="column" backgroundColor="transparent" height="100vh">
          <RadialGradient />
          <Navbar />
          <Flex
            key={chainId}
            justifyContent="center"
            mx="auto"
            maxWidth="container.xl"
            marginBottom={20}
            width="full"
            flex="1 1 auto "
          >
            {children}
          </Flex>
          <Flex paddingY={10} paddingX={6} alignSelf="flex-end">
            <Status />
          </Flex>
        </Flex>
    </>
  )
}

export default AppLayout
