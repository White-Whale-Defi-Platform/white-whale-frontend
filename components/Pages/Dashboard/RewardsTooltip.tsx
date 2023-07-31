import React from 'react'
import { useEffect, useRef, useState } from 'react'

import { Box, HStack, Text, Tooltip, VStack } from '@chakra-ui/react'

import { WhaleType } from './BondingOverview'

export const RewardsTooltip = ({ value, whale, isWalletConnected }) => {
  const TokenDetail = ({ whaleType, value }) => (
    <HStack justify="space-between" direction="row" width="full" px={2}>
      <Text color="whiteAlpha.600" fontSize={14}>
        {WhaleType[whaleType]}
      </Text>
      <Text fontSize={14}>{isWalletConnected ? value : 'n/a'}</Text>
    </HStack>
  )

  const textRef = useRef(null)
  const [textWidth, setTextWidth] = useState(0)

  useEffect(() => {
    setTextWidth(textRef.current.offsetWidth)
  }, [whale])

  return (
    <Tooltip
      sx={{ boxShadow: 'none' }}
      label={
        isWalletConnected ? (
          <VStack
            minW="250px"
            minH="fit-content"
            borderRadius="10px"
            bg="blackAlpha.900"
            px="4"
            py="4"
            position="relative"
            border="none"
            justifyContent="center"
            alignItems="center"
          >
            <TokenDetail whaleType={WhaleType.WHALE} value={whale} />
          </VStack>
        ) : null
      } // Displaying nothing when wallet disconnected
      bg="transparent"
    >
      <VStack alignItems="flex-start" minW={50}>
        <Text ref={textRef} mb="-0.3rem" color="white">
          {value}
        </Text>
        <Box pb={1}>
          {value !== 'n/a' && (
            <div
              style={{
                width: `${textWidth}px`,
                height: '1px',
                background: `repeating-linear-gradient(
            to right,
            white,
            white 1px,
            transparent 1px,
            transparent 5px
          )`,
              }}
            />
          )}
        </Box>
      </VStack>
    </Tooltip>
  )
}
