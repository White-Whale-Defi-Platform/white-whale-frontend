import React from 'react'

import { Button, HStack, PopoverTrigger, Text } from '@chakra-ui/react'
import { useConnectedWallet } from '@terra-money/wallet-provider'

import ChevronDownIcon from '../../icons/ChevronDownIcon'

function ChainSelectTrigger({ connected, denom, currentWalletState }) {
  const connectedWallet = useConnectedWallet()
  const isStation = currentWalletState?.activeWallet === "station"
  return (
    <PopoverTrigger>
      {connected || connectedWallet ? (
        <HStack as={Button} variant="unstyled">
          <Text fontSize={['14px', '16px']}>{denom}</Text>
          {!isStation && <ChevronDownIcon />}
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
}

export default ChainSelectTrigger
