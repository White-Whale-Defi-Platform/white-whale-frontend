import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useCosmwasmClient } from 'hooks/useCosmwasmClient'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { formatPrice, num } from 'libs/num'
import { useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { useQueryMultiplePoolsLiquidity } from 'queries/useQueryPools'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { getPairAprAndDailyVolume } from 'util/coinhall'
import { STABLE_COIN_LIST } from 'util/constants'

import AllPoolsTable from './AllPoolsTable'
import MobilePools from './MobilePools'
import MyPoolsTable from './MyPoolsTable'
import { useQuery } from 'react-query'

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {}

const commingSoonNetworks = ['chihuahua', 'injective', 'comdex']
const subqueryNetorks = ['injective']
const COMING_SOON = 'coming soon'
const NoPrice = ["ASH-BDOG", 'ASH-GDOG']

const calcuateTotalLiq = (pool) => {
  return NoPrice.includes(pool?.pool_id) ? 'NA' : pool?.usdLiquidity || pool.liquidity?.available?.total?.dollarValue
}

const calculateMyPostion = (pool) => {
  const totalLiq = calcuateTotalLiq(pool);
  const { provided, total } = pool.liquidity?.available || {}
  return num(provided?.tokenAmount).times(totalLiq).div(total?.tokenAmount).dp(2).toNumber()
}

const useAprAndVolume = (pools, chainId) => {
  return useQuery(['apr', pools, chainId], async () => await getPairAprAndDailyVolume(pools, chainId))
}


const Pools: FC<Props> = () => {
  const { chainId, status } = useRecoilValue(walletState)
  const client = useCosmwasmClient(chainId)
  const router = useRouter()
  const chainIdParam = router.query.chainId as string
  const { data: poolList } = usePoolsListQuery()
  const [pools, isLoading] = useQueriesDataSelector(
    useQueryMultiplePoolsLiquidity({
      refetchInBackground: false,
      pools: poolList?.pools,
      client,
    })
  )

  const showCommingSoon = useMemo(
    () => commingSoonNetworks.includes(chainId?.split('-')?.[0]),
    [chainId]
  )

  
  const { data: poosWithAprAnd24HrVolume = [], isLoading: isLoadingAprVolume } = useAprAndVolume(pools, chainId)
  
  const allPools = useMemo(() => {
    if (!pools || pools.length === 0) return
    const _pools = pools.map((pool: any) => {
      return {
        ...pool,
        ...poosWithAprAnd24HrVolume.find(
          (row: any) => row.pairAddress === pool.swap_address
        ),
      }
    })
    return _pools.map((pool) => {
      const displayAssetOrder = pool.displayName.split('-')
      const isUSDPool =
        STABLE_COIN_LIST.includes(pool?.pool_assets[0].symbol) ||
        STABLE_COIN_LIST.includes(pool?.pool_assets[1].symbol)
      const pairInfos = pool.liquidity.reserves.total
      const asset0Balance = pairInfos[0] / 10 ** pool.pool_assets[0].decimals
      const asset1Balance = pairInfos[1] / 10 ** pool.pool_assets[1].decimals
      let price = 0
      if (displayAssetOrder[0] === pool.assetOrder[0]) {
        price = asset0Balance === 0 ? 0 : asset1Balance / asset0Balance
      } else {
        price = asset1Balance === 0 ? 0 : asset0Balance / asset1Balance
      }
      return {
        contract: pool?.swap_address,
        pool: pool?.displayName,
        poolId: pool?.pool_id,
        token1Img: pool?.displayLogo1,
        token2Img: pool?.displayLogo2,
        apr: showCommingSoon
          ? COMING_SOON
          : `${Number(pool.apr24h).toFixed(2)}%`,
        volume24hr: showCommingSoon
          ? COMING_SOON
          : `$${formatPrice(pool.usdVolume24h)}`,
        totalLiq: calcuateTotalLiq(pool),
        myPosition: calculateMyPostion(pool),
        liquidity: pool.liquidity,
        poolAssets: pool.pool_assets,
        // price: `${isUSDPool ? '$' : ''}${Number(price).toFixed(3)}`,
        price: `${isUSDPool ? '$' : ''}${num(price).dp(3).toNumber()}`,
        isUSDPool: isUSDPool,
        isSubqueryNetwork: subqueryNetorks.includes(chainId?.split('-')?.[0]),
        cta: () => {
          const [asset1, asset2] = pool?.displayName.split('-') || []
          router.push(
            `/${chainIdParam}/pools/new_position?from=${asset1}&to=${asset2}`
          )
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools, client, pools, status])

  // get a list of my pools
  const myPools = useMemo(() => {
    return (
      allPools?.filter(({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0)
        .map((item) => ({
          ...item,
          cta: () =>
            router.push(
              `/${chainIdParam}/pools/manage_liquidity?poolId=${item.poolId}`
            ),
        }))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPools, client, status])

  // get a list of all pools excepting myPools
  const myPoolsId = myPools?.map(({ pool }) => pool)
  const allPoolsForShown = allPools?.filter((item) => !myPoolsId.includes(item.pool))

  return (
    <VStack
      width={{ base: '100%', md: '1160px' }}
      alignItems="center"
      margin="auto"
    >
      <Box width={{ base: '100%' }}>
        <HStack justifyContent="space-between" width="full" paddingY={10}>
          <Text as="h2" fontSize="24" fontWeight="700">
            My Pools
          </Text>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push(`/${chainIdParam}/pools/new_position`)}
          >
            New Position
          </Button>
        </HStack>
        <MyPoolsTable pools={myPools} isLoading={isLoading || isLoadingAprVolume} />
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
          isLoading={isLoading || isLoadingAprVolume }
        />
        <MobilePools pools={allPoolsForShown} ctaLabel="Add Liquidity" />
      </Box>
    </VStack>
  )
}

export default Pools
