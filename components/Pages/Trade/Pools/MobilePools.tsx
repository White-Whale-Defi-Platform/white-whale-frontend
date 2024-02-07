import React from 'react'

import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { IncentiveTooltip } from 'components/InfoTooltip';
import { Liquidity } from 'components/Pages/Trade/Pools/components/Liquidity'
import PoolName from 'components/Pages/Trade/Pools/components/PoolName'
import { Pool } from 'components/Pages/Trade/Pools/types/index'
import { kBg, kBorderRadius } from 'constants/visualComponentConstants'
import { formatPrice } from 'libs/num';
import { useRouter } from 'next/router'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import Apr from './components/Apr'

type Props = {
  pools: Pool[]
  ctaLabel?: string
  aggregatedAdjustedTotalPoolApr?: number
  aggregatedSupply?: number
}

const MobilePools = ({ pools, ctaLabel, aggregatedAdjustedTotalPoolApr,
  aggregatedSupply }: Props) => {
  const router = useRouter()
  const { chainName } = useRecoilValue(chainState)
  return (
    <VStack width="full" display={['flex', 'flex', 'flex', 'none']} gap={8}>
      {aggregatedAdjustedTotalPoolApr && aggregatedSupply && (
        <HStack background={kBg}
          boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
          borderRadius={kBorderRadius}
          justifyContent="space-between"
          px={9}
          py={3}
          width={['full']}
        >
          <Text color={'brand.50'} fontWeight={'bold'} fontSize={13}>Total Supplied:</Text>
          <Text fontWeight={'bold'}>{`$${aggregatedSupply.toFixed(2)}`}</Text>
          <Text color={'brand.50'} fontWeight={'bold'} fontSize={13}>Total APR:</Text>
          <Text fontWeight={'bold'}>{`${aggregatedAdjustedTotalPoolApr.toFixed(2)}%`}</Text>
        </HStack>
      )}
      {pools &&
        pools.map((pool) => (
          <VStack
            key={pool?.pool}
            padding={10}
            width={['full']}
            background={kBg}
            boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
            borderRadius={kBorderRadius}
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
              {pool?.apr === 'n/a' ? <Text>n/a</Text> : <Apr apr={Number(pool?.apr).toFixed(2)}
                flows={pool?.flows} />}
            </HStack>

            <HStack height="24px" />

            <HStack width="full" justifyContent="space-between">
              <Text color="brand.50">{'Total Liquidity'}</Text>
              {pool?.flows.length > 0 ? (<HStack><Box><IncentiveTooltip iconSize={'3'} /></Box><Text color="brand.50">{'Incentives'}</Text></HStack>) : null}
              <Text color="brand.50">{'24h Volume'}</Text>
            </HStack>

            <HStack width="full" justifyContent="space-between">
              <Liquidity
                liquidity={`$${formatPrice(pool?.totalLiq)}`}
                infos={pool}
              />
              {pool?.flows.length > 0 ? (pool.incentives) : null}
              <Text>{pool?.volume24hr === 'n/a' ? 'n/a' : `$${formatPrice(pool?.volume24hr)}`}</Text>
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
