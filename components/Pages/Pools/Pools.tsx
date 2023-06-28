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
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import {
  getPairAprAndDailyVolume,
  EnigmaPoolData,
  getPairAprAndDailyVolumeTerra,
} from 'util/enigma'
import { STABLE_COIN_LIST } from 'util/constants'
import { ActionCTAs } from './ActionCTAs'
import AllPoolsTable from './AllPoolsTable'
import MobilePools from './MobilePools'
import MyPoolsTable from './MyPoolsTable'
import { useChains } from 'hooks/useChainInfo'
import {
  IncentivePoolInfo,
  useIncentivePoolInfo,
} from 'components/Pages/Incentivize/hooks/useIncentivePoolInfo'
import { Incentives } from 'components/Pages/Pools/Incentives'
import { INCENTIVE_ENABLED_CHAIN_IDS } from 'constants/bonding_contract'
import usePrices from 'hooks/usePrices'
import {
  aprHelperState,
  updateAPRHelperState,
} from 'state/atoms/aprHelperState'

type PoolData = PoolEntityTypeWithLiquidity &
  EnigmaPoolData & {
    displayName: string
    displayLogo1: string
    displayLogo2: string
    myIncentiveApr: number
  }

export type YearlyIncentiveDollarEmission = {
  poolId: string
  yearlyIncentiveDollarEmission: number
}

const Pools = () => {
  const [allPools, setAllPools] = useState<any[]>([])
  const [isInitLoading, setInitLoading] = useState<boolean>(true)
  const { chainId, status, client } = useRecoilValue(walletState)
  const [_, setAPRs] = useRecoilState(aprHelperState)

  const isWalletConnected: boolean = status === WalletStatusType.connected
  const [incentivePoolsLoaded, setIncentivePoolsLoaded] = useState(
    !INCENTIVE_ENABLED_CHAIN_IDS.includes(chainId)
  )
  const cosmWasmClient = useCosmwasmClient(chainId)
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
      client: cosmWasmClient,
    })
  )
  const prices = usePrices()
  const chains: any = useChains()
  const currentChainPrefix = useMemo(
    () =>
      chains.find((row) => row.chainId === chainId)?.bech32Config
        ?.bech32PrefixAccAddr,
    [chains, chainId]
  )

  const incentivePoolInfos: IncentivePoolInfo[] = useIncentivePoolInfo(
    cosmWasmClient,
    pools,
    currentChainPrefix
  )

  const [
    myYearlyIncentiveDollarEmissions,
    setMyYearlyIncentiveDollarEmissions,
  ] = useState<YearlyIncentiveDollarEmission[]>(null)
  useEffect(() => {
    const fetchMyYearlyIncentiveDollarEmissions = async () => {
      const result = await Promise.all(
        (incentivePoolInfos ?? []).map(async (incentivePoolInfo) => {
          const usdEmissions =
            incentivePoolInfo?.flowData?.reduce(
              (acc, flowData) =>
                acc +
                flowData.myDailyEmission *
                  (prices?.[flowData.tokenSymbol] || 0),
              0
            ) * 365.25
          return {
            poolId: incentivePoolInfo.poolId,
            yearlyIncentiveDollarEmission: usdEmissions,
          }
        })
      )
      setMyYearlyIncentiveDollarEmissions(result)
    }
    fetchMyYearlyIncentiveDollarEmissions()
  }, [incentivePoolInfos, client, poolList?.pools])

  const calculateMyPosition = (pool) => {
    const { dollarValue } = pool.liquidity?.providedTotal || {}
    return dollarValue
  }
  useEffect(() => {
    if (
      !pools ||
      (pools && pools.length === 0) ||
      !incentivePoolsLoaded ||
      isLoading
    )
      return
    if (allPools.length > 0) {
      return
    }
    const initPools = async () => {
      setInitLoading(true)
      const poolsWithAprAnd24HrVolume: EnigmaPoolData[] =
        currentChainPrefix === 'terra'
          ? await getPairAprAndDailyVolumeTerra(pools)
          : await getPairAprAndDailyVolume(pools, currentChainPrefix)

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

          const flows =
            incentivePoolInfos?.find((info) => info.poolId === pool.pool_id)
              ?.flowData ?? []
          const yearlyUsd =
            myYearlyIncentiveDollarEmissions?.find(
              (info) => info.poolId === pool.pool_id
            )?.yearlyIncentiveDollarEmission ?? 0
          const myIncentiveApr = (yearlyUsd / calculateMyPosition(pool)) * 100
          const incentiveBaseApr = flows.reduce((total, item) => {
            return total + (isNaN(item.apr) ? 0 : Number(item.apr))
          }, 0)

          updateAPRHelperState(
            pool?.pool_id,
            pool?.apr7d.toString(),
            incentiveBaseApr,
            setAPRs
          )

          return {
            contract: pool?.swap_address,
            pool: pool?.displayName,
            poolId: pool?.pool_id,
            token1Img: pool?.displayLogo1,
            token2Img: pool?.displayLogo2,
            apr: pool?.apr7d,
            volume24hr: pool?.usdVolume24h,
            totalLiq: pool?.TVL,
            myPosition: calculateMyPosition(pool).toFixed(2),
            myIncentiveApr: myIncentiveApr,
            liquidity: pool?.liquidity,
            poolAssets: pool?.pool_assets,
            price: pool?.ratio,
            isUSDPool: isUSDPool,
            flows: flows,
            incentives: <Incentives key={pool.pool_id} flows={flows} />,
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
  }, [
    pools,
    incentivePoolInfos,
    incentivePoolsLoaded,
    myYearlyIncentiveDollarEmissions,
  ])

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
        <Text as="h2" fontSize="24" fontWeight="700">
          My Pools
        </Text>
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
