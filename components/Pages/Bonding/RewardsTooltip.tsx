import { useEffect, useRef, useState } from 'react'

import { Box, HStack, Text, Tooltip, VStack } from '@chakra-ui/react'
import { WHALE_TOKEN_SYMBOL } from 'constants/index'
import { lastClaimed } from 'util/conversion/numberUtil'

type Props = {
  dollarValue: string
  amount: string
  isWalletConnected: boolean
  daysSinceLastClaim: number
}
export const RewardsTooltip = ({
  dollarValue,
  amount,
  isWalletConnected,
  daysSinceLastClaim,
}: Props) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false)

  const TokenDetail = () => (
    <HStack justify="space-between" direction="row" width="full" px={2}>
      <Text color="whiteAlpha.600" fontSize={14}>
        {WHALE_TOKEN_SYMBOL}
      </Text>
      <Text>{isWalletConnected ? amount : 'n/a'}</Text>
    </HStack>
  )

  const textRef = useRef(null)
  const [textWidth, setTextWidth] = useState(0)

  useEffect(() => {
    setTextWidth(textRef.current.offsetWidth)
  }, [amount])

  return (
    <Tooltip
      sx={{ boxShadow: 'none' }}
      label={
        isWalletConnected ? (
          <VStack
            minW="180px"
            minH="fit-content"
            borderRadius="10px"
            bg="blackAlpha.900"
            boxShadow="0px 0px 4px 4px rgba(255, 255, 255, 0.25)"
            px="2"
            py="2"
            position="relative"
            border="none"
            justifyContent="center"
            alignItems="center"
          >
            <TokenDetail />
            <HStack justify="space-between" direction="row" width="full" px={2}>
              <Text color="whiteAlpha.600" fontSize={14}>
                {'Last Claimed'}
              </Text>
              <Text fontSize={14}>{lastClaimed(daysSinceLastClaim)}</Text>
            </HStack>
          </VStack>
        ) : null
      } // Displaying nothing when wallet disconnected
      bg="transparent"
    >
      <VStack alignItems="flex-start" minW={50} mt={-2} onMouseEnter={() => setIsLabelOpen(true)}
        onMouseLeave={() => setIsLabelOpen(false)}
        onClick={() => setIsLabelOpen(!isLabelOpen)}>
        <Text ref={textRef} mb="-0.3rem" color="white" fontWeight={'bold'}>
          {dollarValue}
        </Text>
        <Box pb={1}>
          {dollarValue !== 'n/a' && (
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
