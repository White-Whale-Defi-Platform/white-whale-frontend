import React from 'react'

import { Button, HStack, PopoverTrigger, Text } from '@chakra-ui/react'
import ChevronDownIcon from 'components/Icons/ChevronDownIcon'

const ChainSelectTrigger = ({ connected, denom }) => (
  <PopoverTrigger>
    {connected ? (
      <HStack as={Button} variant="unstyled">
        <Text fontSize={['14px', '16px']}>{denom}</Text>
        <ChevronDownIcon />
      </HStack>
    ) : (
      <HStack
        as={Button}
        variant="unstyled"
        backgroundColor="rgba(0, 0, 0, 0.5)"
        color="white"
        borderRadius="full"
        justifyContent="center"
        alignItems="center"
        paddingX={6}
        paddingY={1}
      >
        <Text fontSize={['14px', '16px']}>{denom}</Text>
        <ChevronDownIcon />
      </HStack>
    )}
  </PopoverTrigger>
)

export default ChainSelectTrigger
