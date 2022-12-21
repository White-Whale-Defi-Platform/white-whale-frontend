import { FC, ReactNode } from 'react'
import {
  BrowserView,
  isBrowser,
  isMobile,
  MobileView,
} from 'react-device-detect'

import { Flex, useMediaQuery } from '@chakra-ui/react'
import Navbar from 'components/Navbar'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import Status from '../Status'
import MobileNotSupportedModal from '../Wallet/Modal/MobileNotSupportedModal'
import RadialGradient from './RadialGradient'

// import { useRouter } from "next/router";

const AppLayout: FC<ReactNode> = ({ children }) => {
  const { chainId } = useRecoilValue(walletState)
  const [isMobileView] = useMediaQuery('(max-width: 480px)')

  // const router = useRouter()

  // useEffect(() => {
  //   router.replace("/swap")
  // },[chainId])

  return (
    <>
      {(isMobile || isMobileView) && <MobileNotSupportedModal />}
      <Flex
        direction="column"
        backgroundColor="transparent"
        height="100vh"
        // paddingBottom={8}
      >
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
