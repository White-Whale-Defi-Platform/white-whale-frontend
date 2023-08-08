import React, { FC } from 'react'

import { Flex } from '@chakra-ui/react'

import Loader from './Loader'

const AppLoading: FC = () => (
  <Flex
    width="100vw"
    height="100vh"
    padding="unset"
    margin="unset"
    className="loader"
    position="absolute"
    justifyContent="center"
    alignItems="center"
    overflow="hidden"
  >
    <Loader />
  </Flex>
)

export default AppLoading
