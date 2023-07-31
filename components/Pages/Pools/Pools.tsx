import { useEffect, useMemo, useState } from 'react'

import { InfoOutlineIcon } from '@chakra-ui/icons'
import {
  Box,
  HStack,
  Stack,
  Switch,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import {
  Config,
  useConfig,
} from 'components/Pages/Dashboard/hooks/useDashboardData'
import { useCurrentEpoch } from 'components/Pages/Incentivize/hooks/useCurrentEpoch'
import { useIncentivePoolInfo } from 'components/Pages/Incentivize/hooks/useIncentivePoolInfo'
import { Incentives } from 'components/Pages/Pools/Incentives'
import { INCENTIVE_ENABLED_CHAIN_IDS } from 'constants/bondingContract'
import { STABLE_COIN_LIST } from 'constants/settings'
import { useChains } from 'hooks/useChainInfo'
import { useCosmwasmClient } from 'hooks/useCosmwasmClient'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import {
  PoolEntityTypeWithLiquidity,
  useQueryPoolsLiquidity,
} from 'queries/useQueryPoolsLiquidity'
import { useRecoilState, useRecoilValue } from 'recoil'
import {
  aprHelperState,
  updateAPRHelperState,
} from 'state/atoms/aprHelperState'
import { WalletStatusType, walletState } from 'state/atoms/walletAtoms'
import { EnigmaPoolData } from 'util/enigma'

import { ActionCTAs } from './ActionCTAs'
import AllPoolsTable from './AllPoolsTable'
import MobilePools from './MobilePools'
import MyPoolsTable from './MyPoolsTable'

type PoolData = PoolEntityTypeWithLiquidity &
  EnigmaPoolData & {
    displayName: string
    displayLogo1: string
    displayLogo2: string
    myIncentiveApr: number
  }

const Pools = () => {
  const [allPools, setAllPools] = useState<any[]>([])
  const [isInitLoading, setInitLoading] = useState<boolean>(true)
  const { chainId, status, network } = useRecoilValue(walletState)
  const [_, setAprHelperState] = useRecoilState(aprHelperState)
  const isWalletConnected: boolean = status === WalletStatusType.connected
  const [incentivePoolsLoaded, setIncentivePoolsLoaded] = useState(
    !INCENTIVE_ENABLED_CHAIN_IDS.includes(chainId)
  )
  const [showAllPools, setShowAllPools] = useState<boolean>(false)
  const cosmwasmClient = useCosmwasmClient(chainId)
  const config: Config = useConfig(network, chainId)

  const { data: currentEpochData } = useCurrentEpoch(cosmwasmClient, config)
  const currentEpoch = useMemo(
    () => Number(currentEpochData?.currentEpoch?.epoch.id),
    [currentEpochData]
  )

  const router = useRouter()
  const chainIdParam = router.query.chainId as string
  const { data: poolList } = usePoolsListQuery()
  const [pools, isLoading]: readonly [
    PoolEntityTypeWithLiquidity[],
    boolean,
    boolean
  ] = useQueriesDataSelector(
    useQueryPoolsLiquidity({
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

  // @ts-ignore
  if (window.debugLogsEnabled) {
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
    ) {
      return
    }
    if (allPools.length > 0) {
      return
    }
    const initPools = async () => {
      setInitLoading(true)

      const _pools: PoolData[] = pools.map((pool: any) => ({
        ...pool,
        ...pairInfos.find((row: any) => row.pool_id === pool.pool_id),
      }))

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
            isUSDPool,
            flows: [],
            incentives: <Incentives key={pool.pool_id} flows={[]} />,
            action: (
              <ActionCTAs
                chainIdParam={chainIdParam}
                chainId={chainId}
                pool={pool}
              />
            ),
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
      const flows = (
        incentivePoolInfos?.find((info) => info.poolId === pool.poolId)
          ?.flowData ?? []
      ).filter((flow) => flow.endEpoch >= currentEpoch)

      const incentiveBaseApr = flows.reduce(
        (total, item) => total + (isNaN(item.apr) ? 0 : Number(item.apr)),
        0
      )

      updateAPRHelperState(
        pool?.poolId,
        pool?.apr,
        incentiveBaseApr,
        setAprHelperState
      )
      if (flows) {
        return {
          ...pool,
          flows,
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
  // Get a list of all myPools pools
  const myPoolsId = useMemo(() => myPools?.map(({ pool }) => pool), [myPools])

  const allPoolsForShown = useMemo(
    () => allPools?.filter((item) => !myPoolsId?.includes(item.pool)),
    [allPools, myPoolsId]
  )
  const parseLiquidity = (liqString) => {
    const value = parseFloat(liqString.replace(/[^\d.-]/g, ''))
    return liqString.toUpperCase().includes('K') ? value * 1000 : value
  }
  const showAllPoolsList = useMemo(() => {
    const pools = allPoolsForShown
    return showAllPools
      ? pools
      : pools.filter((item) => parseLiquidity(item.totalLiq) > 1000)
  }, [allPoolsForShown, showAllPools])

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
          <Stack direction="row">
            <Tooltip
              label={
                <Box
                  maxWidth="250px"
                  minWidth="fit-content"
                  borderRadius="10px"
                  bg="black"
                  color="white"
                  fontSize={14}
                  p={4}
                  whiteSpace="pre-wrap"
                >
                  By default, pools with less than $1.0k total liquidity will be
                  hidden but optionally can be shown.
                </Box>
              }
              bg="transparent"
              hasArrow={false}
              placement="bottom"
              closeOnClick={false}
              arrowSize={0}
            >
              <Text as="h6" fontSize="14" fontWeight="700">
                <InfoOutlineIcon marginRight={2} mb={1} />
                Show All Pools
              </Text>
            </Tooltip>
            <Switch
              isChecked={showAllPools}
              onChange={() => setShowAllPools(!showAllPools)}
              colorScheme="green"
              size="sm"
            ></Switch>
          </Stack>
        </HStack>

        <AllPoolsTable
          pools={showAllPoolsList}
          isLoading={isLoading || isInitLoading || pairInfos.length === 0}
        />
        <MobilePools pools={allPoolsForShown} ctaLabel="Add Liquidity" />
      </Box>
    </VStack>
  )
}

export default Pools
