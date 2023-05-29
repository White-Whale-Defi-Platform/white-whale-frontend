import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useCosmwasmClient } from 'hooks/useCosmwasmClient'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { num } from 'libs/num'
import { useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import {
  PoolEntityTypeWithLiquidity,
  useQueryMultiplePoolsLiquidity,
} from 'queries/useQueryPools'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { getPairAprAndDailyVolume, EnigmaPoolData, getPairAprAndDailyVolumeTerra } from 'util/enigma'
import { STABLE_COIN_LIST } from 'util/constants'

import AllPoolsTable from './AllPoolsTable'
import MobilePools from './MobilePools'
import MyPoolsTable from './MyPoolsTable'
import { useChains } from 'hooks/useChainInfo'

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {}

const NoPrice = ['ASH-BDOG', 'ASH-GDOG']

type PoolData = PoolEntityTypeWithLiquidity &
  EnigmaPoolData & {
    displayName: string
    displayLogo1: string
    displayLogo2: string
  }

const Pools: FC<Props> = () => {
  const [allPools, setAllPools] = useState<any[]>([])
  const [isInitLoading, setInitLoading] = useState<boolean>(true)
  const { address, chainId } = useRecoilValue(walletState)
  const client = useCosmwasmClient(chainId)
  const router = useRouter()
  const chainIdParam = router.query.chainId as string
  const { data: poolList } = usePoolsListQuery()
  const [pools, isLoading]: readonly [
    PoolEntityTypeWithLiquidity[],
    boolean,
    boolean
  ] = useQueriesDataSelector(
    useQueryMultiplePoolsLiquidity({
      refetchInBackground: false,
      pools: poolList?.pools,
      client,
    })
  )
  const chains: any = useChains()

  const currentChain = useMemo(
    () =>
      chains.find((row) => row.chainId === chainId)?.bech32Config
        ?.bech32PrefixAccAddr,
    [chains, chainId]
  )

  const calculateTotalLiq = (pool) => {
    return NoPrice.includes(pool?.pool_id)
      ? 'NA'
      : pool?.usdLiquidity || pool.liquidity?.available?.total?.dollarValue
  }

  const calculateMyPosition = (pool) => {
    const totalLiq = calculateTotalLiq(pool)
    const { provided, total } = pool.liquidity?.available || {}
    return num(provided?.tokenAmount)
      .times(totalLiq)
      .div(total?.tokenAmount)
      .dp(6)
      .toNumber()
  }

  const initPools = useCallback(async () => {
    if (!pools || (pools && pools.length === 0)) return
    if (allPools.length > 0) {
      return
    }
    setInitLoading(true)
    const poolsWithAprAnd24HrVolume: EnigmaPoolData[] = currentChain === 'terra' ? await getPairAprAndDailyVolumeTerra(pools) :
      await getPairAprAndDailyVolume(pools, currentChain)

    const _pools: PoolData[] = pools.map((pool: any) => {
      return {
        ...pool,
        ...poolsWithAprAnd24HrVolume.find(
          (row: any) => row.pool_id === pool.pool_id
        ),
      }
    })
    const _allPools = await Promise.all(
      _pools.map(async (pool) => {
        const isUSDPool =
          STABLE_COIN_LIST.includes(pool?.pool_assets[0].symbol) ||
          STABLE_COIN_LIST.includes(pool?.pool_assets[1].symbol)
        return {
          contract: pool?.swap_address,
          pool: pool?.displayName,
          poolId: pool?.pool_id,
          token1Img: pool?.displayLogo1,
          token2Img: pool?.displayLogo2,
          apr: pool?.apr7d,
          volume24hr: pool?.usdVolume24h,
          totalLiq: pool?.TVL,
          myPosition: calculateMyPosition(pool),
          liquidity: pool?.liquidity,
          poolAssets: pool?.pool_assets,
          price: pool?.ratio,
          isUSDPool: isUSDPool,
          isSubqueryNetwork: false,
          cta: () => {
            const [asset1, asset2] = pool?.pool_id.split('-') || []
            router.push(
              `/${chainIdParam}/pools/new_position?from=${asset1}&to=${asset2}`
            )
          },
        }
      })
    )
    setAllPools(_allPools)
    setTimeout(() => {
      setInitLoading(false)
    }, 500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools])

  useEffect(() => {
    initPools()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, client, pools])

  // get a list of my pools
  const myPools = useMemo(() => {
    return (
      allPools &&
      allPools
        .filter(({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0)
        .map((item) => ({
          ...item,
          // myPosition: formatPrice(item?.liquidity?.providedTotal?.dollarValue),
          // myPosition: NoPrice.includes(item?.poolId)? 'NA' : formatPrice(item?.liquidity?.providedTotal?.dollarValue),
          // myPosition : calculateMyPostion(item),
          cta: () =>
            router.push(
              `/${chainIdParam}/pools/manage_liquidity?poolId=${item.poolId}`
            ),
        }))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPools])

  // get a list of all pools excepting myPools
  const myPoolsId = myPools && myPools.map(({ pool }) => pool)
  const allPoolsForShown =
    allPools && allPools.filter((item) => !myPoolsId.includes(item.pool))

  return (
    <VStack
      width={{ base: '100%', md: 'auto' }}
      alignItems="center"
      margin="auto"
    >
      <Box width={{ base: '100%' }}>
        <HStack justifyContent="space-between" width="full" paddingY={10}>
          <Text as="h2" fontSize="24" fontWeight="700">
            My Pools
          </Text>
          {/* <Button
            variant="primary"
            size="sm"
            onClick={() => router.push(`/${chainIdParam}/pools/new_position`)}
          >
            New Position
          </Button> */}
        </HStack>
        <MyPoolsTable
          show={true}
          pools={myPools}
          isLoading={isLoading || isInitLoading}
        />
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
