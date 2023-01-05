import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { formatPrice } from 'libs/num'
import { useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { useQueryMultiplePoolsLiquidity } from 'queries/useQueryPools'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { getTokenPrice } from 'util/coingecko'
import { getPairApryAnd24HrVolume } from 'util/coinhall'

import AllPoolsTable from './AllPoolsTable'
import MobilePools from './MobilePools'
import MyPoolsTable from './MyPoolsTable'

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {}

const commingSoonNetworks = ['injective', 'comdex']
const COMING_SOON = 'coming soon'

const Pools: FC<Props> = () => {
  const [allPools, setAllPools] = useState<any[]>([])
  const [isInitLoading, setInitLoading] = useState<boolean>(true)
  const router = useRouter()
  const { data: poolList } = usePoolsListQuery()
  const { chainId } = useRecoilValue(walletState)

  const showCommingSoon = useMemo(
    () => commingSoonNetworks.includes(chainId?.split('-')?.[0]),
    [chainId]
  )

  const [pools, isLoading] = useQueriesDataSelector(
    useQueryMultiplePoolsLiquidity({
      refetchInBackground: false,
      pools: poolList?.pools,
    })
  )

  const initPools = useCallback(async () => {
    if (!pools || pools.length === 0) return
    if (allPools.length > 0) return

    setInitLoading(true)

    const poolPairAddrList = pools.map((pool: any) => pool.swap_address)
    const poosWithAprAnd24HrVolume = showCommingSoon
      ? []
      : await getPairApryAnd24HrVolume(poolPairAddrList)

    const _pools = pools.map((pool: any) => {
      return {
        ...pool,
        ...poosWithAprAnd24HrVolume.find(
          (row: any) => row.pairAddress === pool.swap_address
        ),
      }
    })

    const _allPools = await Promise.all(
      _pools.map(async (pool) => {
        let price = 0
        if ((pool.isUSDCPool || pool.isLunaxPool) && pool.asset0Price > 0) {
          price = pool.asset0Price / pool.asset1Price
        }
        if (!pool.isUSDCPool && pool.asset1Price > 0) {
          price = pool.asset1Price / pool.asset0Price
        }

        const asset0Price = showCommingSoon
          ? await getTokenPrice(pool?.pool_assets[0].token_address, Date.now())
          : 1

        return {
          contract: pool?.swap_address,
          pool: pool?.dispalyName,
          token1Img: pool?.displayLogo1,
          token2Img: pool?.displayLogo2,
          apr: showCommingSoon
            ? COMING_SOON
            : `${Number(pool.apr24h).toFixed(2)}%`,
          volume24hr: showCommingSoon
            ? COMING_SOON
            : `$${formatPrice(pool.usdVolume24h)}`,
          totalLiq: pool.liquidity.available.total.dollarValue,
          liquidity: pool.liquidity,
          price: showCommingSoon
            ? `$${asset0Price?.toFixed(2)}`
            : `${pool?.isUSDCPool ? '$' : ''}${Number(price).toFixed(3)}`,
          isUSDCPool: pool?.isUSDCPool,
          cta: () =>
            router.push(
              `/pools/new_position?from=${pool.pool_assets?.[0].symbol}&to=${pool.pool_assets?.[1].symbol}`
            ),
        }
      })
    )

    setAllPools(_allPools)
    setInitLoading(false)
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
        <MyPoolsTable pools={myPools} isLoading={isLoading || isInitLoading} />
        <MobilePools pools={myPools} />
      </Box>

      <Box>
        <HStack justifyContent="space-between" width="full" paddingY={10}>
          <Text as="h2" fontSize="24" fontWeight="700">
            All Pools
          </Text>
        </HStack>
        <AllPoolsTable
          pools={allPoolsForShown}
          isLoading={isLoading || isInitLoading}
        />
        <MobilePools pools={allPoolsForShown} ctaLabel="Add Liquidity" />
      </Box>
    </VStack>
  )
}

export default Pools
