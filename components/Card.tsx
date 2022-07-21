import { FC, ReactNode } from 'react'
import { Flex, FlexProps } from '@chakra-ui/react'

interface Props extends FlexProps {
    children: ReactNode
}

const Card: FC<Props> = ({ children, ...props }) => {
    return (
        <Flex
            backgroundColor="rgba(0, 0, 0, 0.5)"
            color="white"
            borderRadius="full"
            justifyContent="center"
            alignItems="center"
            {...props}
        >{children} </Flex>
    )
}

export default Card