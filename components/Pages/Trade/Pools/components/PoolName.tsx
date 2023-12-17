import { Box, HStack, Image, Text } from '@chakra-ui/react'
import FallbackImage from 'components/FallbackImage'

type Props = {
  poolId: string
  token1Img: string
  token2Img: string
}

const PoolName = ({ poolId, token1Img, token2Img }: Props) => (
  <HStack alignItems="center">
    <HStack spacing="-1" width="70px">
      <Box
        boxShadow="lg"
        borderRadius="full"
        position="relative"
        p="5px"
        bg="black"
      >
        <Image
          src={token1Img}
          width="auto"
          maxW="1.6rem"
          maxH="1.6rem"
          style={{ margin: 'unset',
            borderRadius: '50%' }}
          alt="logo-small"
          fallback={
            <FallbackImage
              width="8"
              height="8"
              color={['#5DB7DE', '#343434']}
            />
          }
        />
      </Box>
      <Box
        borderRadius="full"
        p="4px"
        border="1px solid rgba(255, 255, 255, 0.1)"
      >
        <Image
          width="auto"
          minW="1.6rem"
          maxW="1.6rem"
          maxH="1.6rem"
          style={{ margin: 'unset' }}
          src={token2Img}
          alt="logo-small"
          fallback={
            <FallbackImage
              width="7"
              height="7"
              color={['#FFE66D', '#343434']}
            />
          }
        />
      </Box>
    </HStack>
    <Text textAlign="center" fontSize={['12px', '16px']}>
      {poolId}
    </Text>
  </HStack>
)

export default PoolName
