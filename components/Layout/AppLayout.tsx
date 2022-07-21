import { Flex } from "@chakra-ui/react"
import Navbar from 'components/Navbar'
import RadialGradient from "./RadialGradient"
import { FC, ReactNode } from "react";

const AppLayout: FC<ReactNode> = ({ children}) => {

  return (
    <Flex direction="column" backgroundColor="transparent">
      <RadialGradient />
      <Navbar />
      <Flex
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