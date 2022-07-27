import { Flex } from "@chakra-ui/react"
import Navbar from 'components/Navbar'
import RadialGradient from "./RadialGradient"
import { FC, ReactNode} from "react";
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
// import { useRouter } from "next/router";


const AppLayout: FC<ReactNode> = ({ children}) => {
  const { chainId } = useRecoilValue(walletState)
  // const router = useRouter()

  // useEffect(() => {
  //   router.replace("/swap")
  // },[chainId])

  return (
    <Flex direction="column" backgroundColor="transparent">
      <RadialGradient />
      <Navbar />
      <Flex
        key={chainId}
        justifyContent="center"
        mx="auto"
        maxWidth="container.xl"
        marginBottom={20}
        width="full"
      >
        {children}
      </Flex>
    </Flex>

  )
}

export default AppLayout