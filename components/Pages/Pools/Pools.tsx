import { FC, useCallback, useEffect, useState } from 'react'

import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { formatPrice } from 'libs/num'
import { useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { useQueryMultiplePoolsLiquidity } from 'queries/useQueryPools'
import { getPairApryAnd24HrVolume } from 'util/coinhall'

import { POOL_TOKENS_DECIMALS } from '../../../util/constants'
import AllPoolsTable from './AllPoolsTable'
import MobilePools from './MobilePools'
import MyPoolsTable from './MyPoolsTable'

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {}

const Pools: FC<Props> = () => {
  const [allPools, setAllPools] = useState<any[]>([])
  const router = useRouter()
  const { data: poolList } = usePoolsListQuery()

  const [pools, isLoading] = useQueriesDataSelector(
    useQueryMultiplePoolsLiquidity({
      refetchInBackground: false,
      pools: poolList?.pools,
    })
  )

  const initPools = useCallback(async () => {
    if (!pools || pools.length === 0) return
    if (allPools.length > 0) return

    const poolPairAddrList = pools.map((pool: any) => pool.swap_address)
    const poosWithAprAnd24HrVolume = await getPairApryAnd24HrVolume(
      poolPairAddrList
    )

    const _pools = pools.map((pool: any) => {
      return {
        ...pool,
        ...poosWithAprAnd24HrVolume.find(
          (row: any) => row.pairAddress === pool.swap_address
        ),
      }
    })

    const _allPools = _pools.map((pool) => ({
      contract: pool?.swap_address,
      pool: pool?.pool_id,
      token1Img: pool?.pool_id.includes('USDC')
        ? pool.pool_assets?.[0].logoURI
        : pool.pool_assets?.[1].logoURI,
      token2Img: pool?.pool_id.includes('USDC')
        ? pool.pool_assets?.[1].logoURI
        : pool.pool_assets?.[0].logoURI,
      apr: pool.apr24h,
      volume24hr: pool.usdVolume24h,
      totalLiq: pool.liquidity.available.total.dollarValue,
      liquidity: pool.liquidity,
      price: pool.asset1Price > 0 ? pool.asset0Price / pool.asset1Price : 0,
      isUSDCPool: pool?.isUSDCPool,
      cta: () =>
        router.push(
          `/pools/new_position?from=${pool.pool_assets?.[0].symbol}&to=${pool.pool_assets?.[1].symbol}`
        ),
    }))

    setAllPools(_allPools)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools, router])

  useEffect(() => {
    initPools()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools])

  // get a list of my pools
  const myPools = allPools
    .filter(({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0)
    .map((item) => ({
      ...item,
      myPosition: formatPrice(item?.liquidity?.providedTotal?.dollarValue),
      cta: () => router.push(`/pools/manage_liquidity?poolId=${item.pool}`),
    }))

  // get a list of all pools excepting myPools
  const myPoolsId = myPools.map(({ pool }) => pool)
  const allPoolsForShown = allPools.filter(
    (item) => !myPoolsId.includes(item.pool)
  )

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
        <AllPoolsTable pools={allPoolsForShown} isLoading={isLoading} />
        <MobilePools pools={allPoolsForShown} ctaLabel="Add Liquidity" />
      </Box>
    </VStack>
  )
}

export default Pools
