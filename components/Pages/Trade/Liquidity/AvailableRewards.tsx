import { HStack, Text, VStack } from '@chakra-ui/react'

const LineItem = ({ token, isLast }) => (
  <HStack
    justifyContent="space-between"
    width="full"
    borderBottom={!isLast && '1px solid rgba(255, 255, 255, 0.1)'}
    gap={4}
    pb={2}
  >
    <Text>{token?.symbol ?? 'Unknown'}</Text>
    <Text>
      {' '}
      {token?.amount?.toFixed(6) || token.dailyEmission?.toFixed(6)}
    </Text>
  </HStack>
)

export const AvailableRewards = ({ data = [] }) => {
  if (!data.length) {
    return null
  }

  return (
    <VStack minWidth="150px" alignItems="flex-start">
      {data.map((token, index) => (
        <LineItem
          key={token?.denom + index}
          token={token}
          isLast={index == data.length - 1}
        />
      ))}
    </VStack>
  )
}
