import { HStack, Image, Text, VStack } from '@chakra-ui/react'

import { RewardData } from './hooks/useRewards'

type Props = {
  tokens: RewardData[]
}

const TokenRow = ({ item, isLast }: { item: RewardData; isLast: boolean }) => (
  <HStack
    width="full"
    justifyContent="space-between"
    borderBottom={!isLast && '1px solid rgba(255, 255, 255, 0.1)'}
    py={1}
  >
    <HStack gap={[1]} p={2}>
      <Image
        width="auto"
        minW="1.5rem"
        maxW="1.5rem"
        maxH="1.5rem"
        style={{ margin: 'unset' }}
        src={item?.logoURI}
        alt="logo-small"
      />
      <Text fontSize="16px" fontWeight="400">
        {item?.symbol ?? 'Unknown'}
      </Text>
    </HStack>
    <VStack alignItems="flex-end">
      <Text>{item?.amount}</Text>
      <Text color="brand.50" style={{ margin: 'unset' }}>
        =${Number(item?.dollarValue).toFixed(2)}
      </Text>
    </VStack>
  </HStack>
)

const ClaimTable = ({ tokens = [] }: Props) => {
  if (tokens.length === 0) {
    return <Text color="whiteAlpha.700">No rewards available</Text>
  }
  return (
    <VStack
      width="full"
      background={'#151515'}
      boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
      borderRadius="15px"
      maxH="250px"
      overflowY="scroll"
      sx={{
        '&::-webkit-scrollbar': {
          width: '.4rem',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.8)',
        },
      }}
      px="5"
      py="4"
    >
      {tokens?.map((item, index) => (
        <TokenRow
          key={
            (item?.info?.native_token?.denom ??
                item.info.token.contract_addr) + index
          }
          item={item}
          isLast={index === tokens.length - 1}
        />
      ))}
    </VStack>
  )
}

export default ClaimTable
