import { FC, ReactNode } from 'react'
import {
  BrowserView,
  isBrowser,
  isMobile,
  MobileView,
} from 'react-device-detect'

import { Flex, useMediaQuery, Text, Box } from '@chakra-ui/react'
import Navbar from 'components/Navbar'
import { useRecoilValue, useRecoilState } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import Status from '../Status'
import MobileNotSupportedModal from '../Wallet/Modal/MobileNotSupportedModal'
import RadialGradient from './RadialGradient'
import { nodeError as nodeErrorAtom } from 'state/atoms/nodeError'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'

const NodeError = ({isError = false}) => {
  if(!isError) return null

  return (
    <Flex
      justifyContent="center"
      mx="auto"
      maxWidth="container.xl"
      marginBottom={20}
      width="full"
      flex="1 1 auto"
    >
      <Alert status='error' borderRadius="10px">
        <AlertIcon />
        <AlertTitle>Connection Error!</AlertTitle>
        <AlertDescription>Failed to connect, please try again later.</AlertDescription>
      </Alert>
    </Flex>
  
  )
}

// import { useRouter } from "next/router";

const AppLayout: FC<ReactNode> = ({ children }) => {
  const { chainId } = useRecoilValue(walletState)
  const [isMobileView] = useMediaQuery('(max-width: 480px)')
  const nodeError = useRecoilValue(nodeErrorAtom)

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
        <NodeError isError={nodeError} />
        <Flex
          key={chainId}
          justifyContent="center"
          mx="auto"
          maxWidth="container.xl"
          marginBottom={20}
          width="full"
          flex="1 1 auto "
          // blur="100px" 
          filter={nodeError && 'auto' }
          blur={nodeError && '3px'}
        >
          {nodeError  && <Box position="absolute" width="full" height="full" zIndex={1} />}
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
