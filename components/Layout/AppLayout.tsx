import { FC, ReactNode, useMemo } from 'react'
import { isMobile } from 'react-device-detect'

import { useMediaQuery, Flex } from '@chakra-ui/react'
import Navbar from 'components/Navbar'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import Status from '../Status'
import MobileNotSupportedModal from '../Wallet/Modal/MobileNotSupportedModal'
import RadialGradient, { backgrounds } from './RadialGradient'

const AppLayout: FC<ReactNode> = ({ children }) => {
  const { chainId } = useRecoilValue(chainState)
  const [isMobileView] = useMediaQuery('(max-width: 480px)')
  const mobileBrowserLeap = window.leap && window.leap.mode === 'mobile-web'
  const mobileBrowserKeplr = window.keplr && window.keplr.mode === 'mobile-web'
  const background = useMemo(() => backgrounds[chainId], [chainId])
  return (
    <>
      {isMobile && <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          background: background.replace('linear', 'radial').replace('90deg', 'circle'),
        }}
      ></div>}
      {((isMobile || isMobileView) && !(mobileBrowserLeap || mobileBrowserKeplr)) && <MobileNotSupportedModal />}
      {(!(isMobile || isMobileView) || (mobileBrowserLeap || mobileBrowserKeplr)) && (<Flex direction="column" backgroundColor="transparent" height="100vh">
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
      </Flex>)}
    </>
  )
}

export default AppLayout
