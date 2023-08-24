import React from 'react'
import { useEffect, useRef, useState } from 'react'

import { Box, HStack, Text, Tooltip, VStack } from '@chakra-ui/react'

import { WhaleType } from './BondingOverview'

export const RewardsTooltip = ({
  value,
  whale,
  isWalletConnected,
  daysSinceLastClaim,
}) => {
  const lastClaimed = () => {
    if (daysSinceLastClaim >= 21) {
      return '21+ days ago'
    } else if (daysSinceLastClaim === 0) {
      return 'Today'
    }
    const multiple = daysSinceLastClaim === 1 ? '' : 's'
    return `${daysSinceLastClaim} day${multiple} ago`
  }
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
            <HStack justify="space-between" direction="row" width="full" px={2}>
              <Text color="whiteAlpha.600" fontSize={14}>
                {'Last Claimed'}
              </Text>
              <Text fontSize={14}>{lastClaimed()}</Text>
            </HStack>
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
