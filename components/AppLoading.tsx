import React, {FC} from 'react'
import Loader from './Loader'
import { Flex } from '@chakra-ui/react'

const AppLoading:FC = () => {
    return (
        <Flex
            width="100vw"
            height="100vh"
            padding="unset"
            margin="unset"
            className='loader'
            position="absolute"
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
        >
            <Loader />
        </Flex>
    )
}

export default AppLoading