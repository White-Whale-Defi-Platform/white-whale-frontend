import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { IncentiveTooltip } from 'components/InfoTooltip';
import PoolName from 'components/Pages/Trade/Pools/components/PoolName'
import { Pool } from 'components/Pages/Trade/Pools/types/index'
import { useRouter } from 'next/router'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import Apr from './components/Apr'
import Liquidity from './components/liquidity'

type Props = {
  pools: Pool[]
  ctaLabel?: string
}

const MobilePools = ({ pools, ctaLabel }: Props) => {
  const router = useRouter()
  const { chainName } = useRecoilValue(chainState)
  return (
    <VStack width="full" display={['flex', 'flex', 'flex', 'none']} gap={8}>
      {pools &&
        pools.map((pool) => (
          <VStack
            key={pool?.pool}
            padding={10}
            width={['full']}
            background="#1C1C1C"
            boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
            borderRadius="30px"
            justifyContent="center"
          >
            <HStack width="full" justifyContent="space-between">
              <Text color="brand.50">{'Pool'}</Text>
              <Text color="brand.50">{'APR'}</Text>
            </HStack>

            <HStack width="full" justifyContent="space-between">
              <PoolName
                poolId={pool?.pool}
                token1Img={pool.token1Img}
                token2Img={pool?.token2Img}
              />
              <Apr apr={pool.apr.toString()}
                flows={pool.flows}/>
            </HStack>

            <HStack height="24px" />

            <HStack width="full" justifyContent="space-between">
              <Text color="brand.50">{'Total Liquidity'}</Text>
              {pool?.flows.length > 0 ? (<HStack><Box><IncentiveTooltip iconSize={'3'} /></Box><Text color="brand.50">{'Incentives'}</Text></HStack>) : null}
              <Text color="brand.50">{'24h Volume'}</Text>
            </HStack>

            <HStack width="full" justifyContent="space-between">
              <Liquidity
                liquidity={pool.totalLiq.toString()}
                infos={pool}
              />
              {pool?.flows.length > 0 ? (pool.incentives) : null}
              <Text>{` ${pool?.volume24hr}`}</Text>
            </HStack>

            <HStack height="24px" />

            <Button
              variant="outline"
              size="sm"
              width="full"
              onClick={() => router.push(`/${chainName}/pools/manage_liquidity?poolId=${pool?.poolId}`)
              }
            >
              {ctaLabel || 'Manage'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              width="full"
              onClick={() => router.push(`/${chainName}/pools/incentivize?poolId=${pool?.poolId}`)
              }
            >
              {'Incentivize'}
            </Button>
            <Box position="absolute" top="-10px" right="-10px" width="0" height="0" border-top="20px solid #f00" border-left="20px solid transparent"></Box>
          </VStack>
        ))}
    </VStack>
  )
}

export default MobilePools
