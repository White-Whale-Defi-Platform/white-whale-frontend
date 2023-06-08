import { HStack, Spinner, Text } from '@chakra-ui/react'
import { useTokenBalance } from 'hooks/useTokenBalance'

type Props = {
  tokenSymbol: string
}

const Balance = ({ tokenSymbol }: Props) => {
  const { balance, isLoading } = useTokenBalance(tokenSymbol)

  return (
    <HStack>
      <Text marginLeft={4} color="brand.50" fontSize="14" fontWeight="500">
        Balance:{' '}
      </Text>
      {isLoading ? (
        <Spinner color="white" size="xs" />
      ) : (
        <Text fontSize="14" fontWeight="700">
          {balance?.toFixed(6)}
        </Text>
      )}
    </HStack>
  )
}

export default Balance
