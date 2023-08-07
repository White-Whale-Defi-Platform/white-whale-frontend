import { Button, HStack, Text, VStack } from '@chakra-ui/react'

import PoolName from './components/PoolName'
import { Pool } from './types'

type Props = {
  pools: Pool[]
  ctaLabel?: string
}

const MobilePools = ({ pools, ctaLabel }: Props) => (
  <VStack width="full" display={['flex', 'none']} gap={8}>
    {pools &&
      pools.map((pool) => (
        <VStack
          key={pool?.pool}
          padding={10}
          width={['full', '1160px']}
          background={'#1C1C1C'}
          boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
          borderRadius="30px"
          justifyContent="center"
        >
          <HStack width="full" justifyContent="space-between">
            <Text color="brand.50">{'Pool'}</Text>
            <Text color="brand.50">{'APY'}</Text>
          </HStack>

          <HStack width="full" justifyContent="space-between">
            <PoolName
              poolId={pool?.pool}
              token1Img={pool.token1Img}
              token2Img={pool?.token2Img}
            />
            <Text color="brand.50">{'coming soon'}</Text>
          </HStack>

          <HStack height="24px" />

          <HStack width="full" justifyContent="space-between">
            <Text color="brand.50">{'Total Liquidity'}</Text>
            <Text color="brand.50">{'24h volume'}</Text>
          </HStack>

          <HStack width="full" justifyContent="space-between">
            <Text>{`$ ${pool?.totalLiq}`}</Text>
            <Text>{' coming soon'}</Text>
          </HStack>

          <HStack height="24px" />

          <Button
            variant="outline"
            size="sm"
            width="full"
            onClick={() => pool?.cta()}
          >
            {ctaLabel || 'Manage Liquidity'}
          </Button>
        </VStack>
      ))}
  </VStack>
)

export default MobilePools
