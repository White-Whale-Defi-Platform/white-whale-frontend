import { FC, ReactNode } from 'react'

import { Flex } from '@chakra-ui/react'
import Navbar from 'components/Navbar'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import Status from '../Status'
import RadialGradient from './RadialGradient'
// import { useRouter } from "next/router";

const AppLayout: FC<ReactNode> = ({ children }) => {
  const { chainId } = useRecoilValue(walletState)
  // const router = useRouter()

  // useEffect(() => {
  //   router.replace("/swap")
  // },[chainId])

  return (
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
  )
}

export default AppLayout
