import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useCosmwasmClient } from 'hooks/useCosmwasmClient'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { useEffect, useMemo, useState } from 'react'
import {
  PoolEntityTypeWithLiquidity,
  useQueryMultiplePoolsLiquidity,
} from 'queries/useQueryPools'
import { useRecoilValue } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import { EnigmaPoolData } from 'util/enigma'
import { STABLE_COIN_LIST } from 'constants/settings'
import { ActionCTAs } from './ActionCTAs'
import AllPoolsTable from './AllPoolsTable'
import MobilePools from './MobilePools'
import MyPoolsTable from './MyPoolsTable'
import { useChains } from 'hooks/useChainInfo'
import { useIncentivePoolInfo } from 'components/Pages/Incentivize/hooks/useIncentivePoolInfo'
import { Incentives } from 'components/Pages/Pools/Incentives'
import { INCENTIVE_ENABLED_CHAIN_IDS } from 'constants/bonding_contract'

type PoolData = PoolEntityTypeWithLiquidity &
  EnigmaPoolData & {
    displayName: string
    displayLogo1: string
    displayLogo2: string
  }

const Pools = () => {
  const [allPools, setAllPools] = useState<any[]>([])
  const [isInitLoading, setInitLoading] = useState<boolean>(true)
  const { chainId, status } = useRecoilValue(walletState)
  const isWalletConnected: boolean = status === WalletStatusType.connected
  const [incentivePoolsLoaded, setIncentivePoolsLoaded] = useState(
    !INCENTIVE_ENABLED_CHAIN_IDS.includes(chainId)
  )
  const cosmwasmClient = useCosmwasmClient(chainId)
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
      client: cosmwasmClient,
    })
  )
  const myPoolsLength = useMemo(
    () =>
      pools?.filter(
        ({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0
      )?.length,
    [pools]
  )

  const chains: any = useChains()
  const currentChainPrefix = useMemo(
    () =>
      chains.find((row) => row.chainId === chainId)?.bech32Config
        ?.bech32PrefixAccAddr,
    [chains, chainId]
  )

  const {
    flowPoolData: incentivePoolInfos,
    poolsWithAprAnd24HrVolume: pairInfos,
    isLoading: isIncentivePoolInfoLoading,
  } = useIncentivePoolInfo(cosmwasmClient, pools, currentChainPrefix)

  if (window['debugLogsEnabled']) {
    console.log('Pools-Liquidity: ', pools)
    console.log('Incentive-Pool-Infos: ', incentivePoolInfos)
  }

  const calculateMyPosition = (pool) => {
    const { dollarValue } = pool.liquidity?.providedTotal || {}
    return dollarValue.toFixed(2)
  }
  useEffect(() => {
    if (
      !pools ||
      (pools && pools.length === 0) ||
      isLoading ||
      isIncentivePoolInfoLoading ||
      pairInfos.length === 0
    )
      return
    if (allPools.length > 0) {
      return
    }
    const initPools = async () => {
      setInitLoading(true)

      const _pools: PoolData[] = pools.map((pool: any) => {
        return {
          ...pool,
          ...pairInfos.find((row: any) => row.pool_id === pool.pool_id),
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
            flows: [],
            incentives: <Incentives key={pool.pool_id} flows={[]} />,
            action: (
              <ActionCTAs
                chainIdParam={chainIdParam}
                chainId={chainId}
                pool={pool}
              />
            ),
            isSubqueryNetwork: false,
          }
        })
      )
      setAllPools(_allPools)
      if (_allPools.length > 0) {
        setInitLoading(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
    initPools()
  }, [pools, incentivePoolInfos, incentivePoolsLoaded, pairInfos])

  const flowLength = useMemo(
    () =>
      incentivePoolInfos
        ?.map((info) => info.flowData?.length ?? 0)
        .reduce((a, b) => a + b, 0) ?? 0,
    [incentivePoolInfos]
  )

  useEffect(() => {
    const updatedPools = allPools.map((pool) => {
      const flows =
        incentivePoolInfos?.find((info) => info.poolId === pool.poolId)
          ?.flowData ?? []
      if (flows) {
        return {
          ...pool,
          flows: flows,
          incentives: <Incentives key={pool.pool_id} flows={flows} />,
        }
      }
      return pool
    })
    setAllPools(updatedPools)
  }, [flowLength, isInitLoading])

  useEffect(() => {
    if (myPoolsLength > 0) {
      const myPools = pools.filter(
        ({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0
      )
      const myPoolIds = myPools.map((pool) => pool.pool_id)
      const updatedPools = allPools.map((pool) => {
        if (myPoolIds.includes(pool.poolId)) {
          return {
            ...pool,
            liquidity: myPools.find((row) => row.pool_id === pool.poolId)
              .liquidity,
          }
        }
        return pool
      })
      setAllPools(updatedPools)
    }
  }, [myPoolsLength])

  useEffect(() => {
    if (incentivePoolInfos?.length > 0) {
      setIncentivePoolsLoaded(true)
    }
  }, [incentivePoolInfos])

  const [myPools, setMyPools] = useState([])

  useEffect(() => {
    if (!isWalletConnected) {
      setMyPools([])
    }
  }, [isWalletConnected])

  useEffect(() => {
    if (allPools && isWalletConnected) {
      const pools = allPools.filter(
        ({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0
      )
      setMyPools(pools)
    }
  }, [allPools])
  // get a list of all myPools pools
  const myPoolsId = useMemo(() => myPools?.map(({ pool }) => pool), [myPools])

  const allPoolsForShown = useMemo(
    () => allPools?.filter((item) => !myPoolsId?.includes(item.pool)),
    [allPools, myPoolsId]
  )

  return (
    <VStack
      width={{ base: '100%', md: 'auto' }}
      alignItems="center"
      margin="auto"
    >
      <Box width={{ base: '100%' }}>
        <Text as="h2" fontSize="24" fontWeight="700">
          My Pools
        </Text>
        <MyPoolsTable
          show={true}
          pools={myPools}
          isLoading={isLoading || isInitLoading || pairInfos.length === 0}
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
          isLoading={isLoading || isInitLoading || pairInfos.length === 0}
        />
        <MobilePools pools={allPoolsForShown} ctaLabel="Add Liquidity" />
      </Box>
    </VStack>
  )
}

export default Pools
