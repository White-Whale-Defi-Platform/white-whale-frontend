import { Box, HStack, Image, Text, Tooltip } from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons'
import FallbackImage from 'components/FallbackImage'

type Props = {
  poolId: string
  token1Img: string
  token2Img: string
  poolAssets?: any[]
}

const PoolName = ({ poolId, token1Img, token2Img, poolAssets }: Props) => {
  const hasWhaleToken = poolAssets?.some(asset =>
    asset.symbol?.toUpperCase().includes('WHALE')
  )

  return (
    <HStack alignItems="center">
      <HStack spacing="-1" width="70px">
        <Box
          boxShadow="lg"
          borderRadius="full"
          position="relative"
          p="5px"
          bg="black"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            src={token1Img}
            width="auto"
            minW="1.6rem"
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
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            width="auto"
            minW="1.6rem"
            maxW="1.6rem"
            maxH="1.6rem"
            style={{ margin: 'unset',
              borderRadius: '50%' }}
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
      <HStack spacing={2}>
        <Text textAlign="center" fontSize={['12px', '16px']}>
          {poolId}
        </Text>
        {hasWhaleToken && (
          <Tooltip label="Affected by the Migaloo chain discontinuation.">
            <WarningIcon color="yellow.400" />
          </Tooltip>
        )}
      </HStack>
    </HStack>
  )
}

export default PoolName;
