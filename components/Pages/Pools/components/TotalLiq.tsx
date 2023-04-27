import { InfoOutlineIcon } from '@chakra-ui/icons'
import { Box, HStack, Tooltip, VStack, Text } from '@chakra-ui/react'
import React from 'react'
import { formatPrice, fromChainAmount } from 'libs/num'

type Props = {
  poolId: string
  liquidity: string
  totalLiq: string | number
  poolAssets: any[]
}

const TotalLiq = ({ poolId, liquidity, totalLiq, poolAssets }: Props) => {
  const [tokenAReserve, tokenBReserve] = liquidity?.reserves?.total || []
  const [tokenA, tokenB] = poolId?.split('-') || []
  const [assetA, assetB] = poolAssets || []

  return (
    <HStack justifyContent="end">
      {/* <Text align="right">{`$${formatPrice(totalLiq)}`}</Text> */}
      <Text align="right">
        {totalLiq !== 'NA' ? `$${formatPrice(totalLiq)}` : totalLiq}
      </Text>
      <Tooltip
        label={
          // Pool is is HUAHUA-WHALE?
          poolId === 'HUAHUA-WHALE' ? (
            <VStack>
              <Text>
                {tokenA}: {fromChainAmount(tokenBReserve, assetB?.decimals)}
              </Text>
              <Text>
                {tokenB}: {fromChainAmount(tokenAReserve, assetA?.decimals)}
              </Text>
            </VStack>
          ) : (
            <VStack>
              <Text>
                {tokenA}: {fromChainAmount(tokenAReserve, assetA?.decimals)}
              </Text>
              <Text>
                {tokenB}: {fromChainAmount(tokenBReserve, assetB?.decimals)}
              </Text>
            </VStack>
          )
        }
        padding="20px"
        borderRadius="20px"
        bg="blackAlpha.900"
        fontSize="xs"
        maxW="330px"
      >
        <Box cursor="pointer" color="brand.50">
          <InfoOutlineIcon width=".9rem" height=".9rem" />
        </Box>
      </Tooltip>
    </HStack>
  )
}

export default TotalLiq
