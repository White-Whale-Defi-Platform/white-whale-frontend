import { FC, useMemo } from 'react'

import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { formatPrice } from 'libs/num'
import { useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { useQueryMultiplePoolsLiquidity } from 'queries/useQueryPools'

import AllPoolsTable from './AllPoolsTable'
import MobilePools from './MobilePools'
import MyPoolsTable from './MyPoolsTable'

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {}

const Pools: FC<Props> = () => {
  const router = useRouter()
  const { data: poolList } = usePoolsListQuery()

  const [pools, isLoading] = useQueriesDataSelector(
    useQueryMultiplePoolsLiquidity({
      refetchInBackground: false,
      pools: poolList?.pools,
    })
  )

  const myPools = useMemo(() => {
    if (!pools) return []

    return pools
      .filter(({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0)
      .map((pool) => ({
        contract: pool?.swap_address,
        pool: pool?.pool_id,
        token1Img: pool?.pool_id.includes('USDC')
          ? pool.pool_assets?.[0].logoURI
          : pool.pool_assets?.[1].logoURI,
        token2Img: pool?.pool_id.includes('USDC')
          ? pool.pool_assets?.[1].logoURI
          : pool.pool_assets?.[0].logoURI,
        myPosition: formatPrice(pool?.liquidity?.providedTotal?.dollarValue),
        apr: 'coming soon',
        volume24hr: 'coming soon',
        totalLiq: pool.liquidity.available.total.dollarValue,
        cta: () =>
          router.push(`/pools/manage_liquidity?poolId=${pool?.pool_id}`),
      }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools])

  const allPools = useMemo(() => {
    if (!pools) return []

    const myPoolsId = myPools.map(({ pool }) => pool)

    return pools
      .map((pool) => ({
        contract: pool?.swap_address,
        pool: pool?.pool_id,
        token1Img: pool?.pool_id.includes('USDC')
          ? pool.pool_assets?.[0].logoURI
          : pool.pool_assets?.[1].logoURI,
        token2Img: pool?.pool_id.includes('USDC')
          ? pool.pool_assets?.[1].logoURI
          : pool.pool_assets?.[0].logoURI,
        apr: 'coming soon',
        volume24hr: 'coming soon',
        totalLiq: pool.liquidity.available.total.dollarValue,
        cta: () =>
          router.push(
            `/pools/new_position?from=${pool.pool_assets?.[0].symbol}&to=${pool.pool_assets?.[1].symbol}`
          ),
      }))
      .filter((item) => !myPoolsId.includes(item.pool))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools, myPools])

  return (
    <VStack
      width={{ base: '100%', md: '1160px' }}
      alignItems="center"
      margin="auto"
    >
      <Box>
        <HStack justifyContent="space-between" width="full" paddingY={10}>
          <Text as="h2" fontSize="24" fontWeight="700">
            My Pools
          </Text>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push(`/pools/new_position`)}
          >
            New Position
          </Button>
        </HStack>
        <MyPoolsTable pools={myPools} isLoading={isLoading} />
        <MobilePools pools={myPools} />
      </Box>

      <Box>
        <HStack justifyContent="space-between" width="full" paddingY={10}>
          <Text as="h2" fontSize="24" fontWeight="700">
            All Pools
          </Text>
        </HStack>
        <AllPoolsTable pools={allPools} isLoading={isLoading} />
        <MobilePools pools={allPools} ctaLabel="Add Liquidity" />
      </Box>
    </VStack>
  )
}

export default Pools
