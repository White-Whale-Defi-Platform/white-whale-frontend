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
import { useChain } from '@cosmos-kit/react-lite'
import { useIncentivePoolInfo } from 'components/Pages/Trade/Incentivize/hooks/useIncentivePoolInfo'
import { ActionCTAs } from 'components/Pages/Trade/Pools/ActionCTAs'
import AllPoolsTable from 'components/Pages/Trade/Pools/AllPoolsTable'
import { usePoolsListQuery } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import {
  PoolEntityTypeWithLiquidity,
  useQueryPoolsLiquidity,
} from 'components/Pages/Trade/Pools/hooks/useQueryPoolsLiquidity'
import { Incentives } from 'components/Pages/Trade/Pools/Incentives'
import MobilePools from 'components/Pages/Trade/Pools/MobilePools'
import MyPoolsTable from 'components/Pages/Trade/Pools/MyPoolsTable'
import { STABLE_COIN_LIST } from 'constants/index'
import { useChainInfos } from 'hooks/useChainInfo'
import { useClients } from 'hooks/useClients'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { useRouter } from 'next/router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { PoolData } from 'services/poolDataProvider'
import { aprHelperState, updateAPRHelperState } from 'state/aprHelperState'
import { chainState } from 'state/chainState'

type AllPoolData = PoolEntityTypeWithLiquidity &
  PoolData & {
    displayName: string
    displayLogo1: string
    displayLogo2: string
    myIncentiveApr: number
  }

const Pools = () => {
  const [allPools, setAllPools] = useState<any[]>([])
  const [isInitLoading, setInitLoading] = useState<boolean>(true)
  const [externalStatsLoading, setExternalStatsLoading] = useState<boolean>(true)

  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(walletChainName)
  const [currentAprHelperState, setAprHelperState] = useRecoilState(aprHelperState)
  const [showAllPools, setShowAllPools] = useState<boolean>(false)
  const { cosmWasmClient } = useClients(walletChainName)

  const router = useRouter()
  const chainIdParam = router.query.chainId as string
  const { data: poolList } = usePoolsListQuery()
  const [pools, isLoading]: readonly [
    AllPoolData[],
    boolean,
    boolean
  ] = useQueriesDataSelector(useQueryPoolsLiquidity({
    refetchInBackground: false,
    pools: poolList?.pools,
    cosmWasmClient,
  }))
  const myPoolsLength = useMemo(() => pools?.filter(({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0)?.length,
    [pools])

  const chains: any = useChainInfos()
  const currentChainPrefix = useMemo(() => chains.find((row: { chainId: string }) => row.chainId === chainId)?.bech32Config?.
    bech32PrefixAccAddr,
  [chains, chainId])

  const {
    flowPoolData: incentivePoolInfos,
    poolsWithAprAnd24HrVolume: pairInfos,
  } = useIncentivePoolInfo(
    cosmWasmClient, pools, currentChainPrefix,
  )
  // @ts-ignore
  if (window.debugLogsEnabled) {
    console.log('Pools-Liquidity: ', pools)
    console.log('Incentive-Pool-Infos: ', incentivePoolInfos)
    console.log('Pair-Infos: ', pairInfos)
    console.log('Loading: ', isLoading)
    console.log('Init Loading: ', isInitLoading)
    console.log('External Loading: ', externalStatsLoading)
  }

  const calculateMyPosition = (pool: AllPoolData) => {
    const { dollarValue } = pool.liquidity?.providedTotal || {}
    return dollarValue.toFixed(2)
  }
  useEffect(() => {
    if (
      !pools ||
      (pools && pools.length === 0) ||
      isLoading
    ) {
      return
    }
    if (allPools.length > 0) {
      return
    }
    const initPools = async () => {
      setInitLoading(true)

      const _allPools = await Promise.all(pools.map((pool) => {
        const isUSDPool =
            STABLE_COIN_LIST.includes(pool?.pool_assets[0].symbol) ||
            STABLE_COIN_LIST.includes(pool?.pool_assets[1].symbol)

        if (externalStatsLoading) {
          setExternalStatsLoading((pool?.liquidity?.reserves?.totalAssetsInDollar || 0) === 0)
        }

        return {
          contract: pool?.swap_address,
          pool: pool?.displayName,
          poolId: pool?.pool_id,
          token1Img: pool?.displayLogo1,
          token2Img: pool?.displayLogo2,
          apr: -1,
          volume24hr: -1,
          totalLiq: pool?.liquidity?.reserves?.totalAssetsInDollar || 0,
          myPosition: calculateMyPosition(pool),
          liquidity: pool?.liquidity,
          poolAssets: pool?.pool_assets,
          price: pool?.liquidity?.reserves?.ratioFromPool,
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
      }))
      setAllPools(_allPools)
      if (_allPools.length > 0) {
        setInitLoading(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
    initPools()
  }, [pools?.length])

  useEffect(() => {
    if (pairInfos.length === 0) {
      return
    }
    let updatedPools = allPools.map((pool) => {
      const pairInfo = pairInfos.find((pairInfo) => pairInfo.pool_id === pool.poolId)
      return {
        ...pool,
        volume24hr: pairInfo?.usdVolume24h,
        apr: pairInfo?.apr7d,
        totalLiq: pool.totalLiq === 0 ? pairInfo?.tvl : pool.totalLiq,
      }
    })

    if (myPoolsLength > 0) {
      const myPools = pools.filter(({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0)
      const myPoolIds = myPools.map((pool) => pool.pool_id)
      updatedPools = updatedPools.map((pool) => {
        if (myPoolIds.includes(pool.poolId)) {
          return {
            ...pool,
            liquidity: myPools.find((row) => row.pool_id === pool.poolId).
              liquidity,
          }
        }
        return pool
      })
    }
    setAllPools(updatedPools)
    setExternalStatsLoading(false)
  }, [myPoolsLength, pairInfos?.length])

  const flowLength = useMemo(() => incentivePoolInfos?.
    map((info) => info.flowData?.length ?? 0).
    reduce((a, b) => a + b, 0) ?? 0,
  [incentivePoolInfos])

  useEffect(() => {
    const updatedPools = allPools.map((pool) => {
      const flows =
        incentivePoolInfos?.find((info) => info.poolId === pool.poolId)?.
          flowData ?? []

      const incentiveBaseApr = flows.reduce((total, item) => total + (isNaN(item.apr) ? 0 : Number(item.apr)),
        0)
      const pairInfo = pairInfos.find((pairInfo) => pairInfo.pool_id === pool.poolId)
      const poolState = currentAprHelperState?.find((state) => state.poolId === pool.poolId)
      updateAPRHelperState(
        pool?.poolId,
        pairInfo ? pairInfo?.apr7d?.toString() : (poolState?.fees.toString() || '0'),
        incentiveBaseApr,
        setAprHelperState,
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

  const [myPools, setMyPools] = useState([])

  useEffect(() => {
    if (!isWalletConnected) {
      setMyPools([])
    }
  }, [isWalletConnected])

  useEffect(() => {
    if (pools && allPools && isWalletConnected) {
      const myLiquidityPools = pools.filter(({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0)
      const updatedPools = allPools.filter((pool) => myLiquidityPools.map((myPool) => myPool.pool_id).includes(pool.poolId)).map((pool) => {
        const myPool = myLiquidityPools.find((myPool) => myPool.pool_id === pool.poolId)
        return {
          ...pool,
          myPosition: calculateMyPosition(myPool),
        }
      })
      setMyPools(updatedPools)
    }
  }, [allPools, isWalletConnected])

  // Get a list of all myPools pools
  const myPoolsId = useMemo(() => myPools?.map(({ pool }) => pool), [myPools])

  const allPoolsForShown = useMemo(() => allPools?.filter((item) => !myPoolsId?.includes(item.pool)),
    [allPools, myPoolsId])

  const showAllPoolsList = useMemo(() => {
    const pools = allPoolsForShown
    return showAllPools
      ? pools
      : pools.filter((item) => item.totalLiq > 1000)
  }, [allPoolsForShown, showAllPools])
  const aggregatedSupply = myPools.reduce((acc, pool) => acc + Number(pool.myPosition), 0)
  const aggregatedAdjustedTotalPoolApr = myPools.map((pool) => {
    const aprState = currentAprHelperState.find((aprState) => pool.poolId === aprState.poolId)
    return (Number(pool.myPosition) / aggregatedSupply) * (aprState.incentives + aprState.fees)
  }).reduce((acc, adjustedApr) => acc + adjustedApr, 0)

  return (
    <VStack
      alignItems="center"
      margin="auto"
    >
      {myPools?.length > 0 && (
        <Box width={'100%'} px={{ base: 5 }}>
          <Text as="h2" fontSize="24" fontWeight="700" paddingTop={10} paddingBottom={5}>
          Supplied
          </Text>
          <MyPoolsTable
            show={true}
            pools={myPools}
            isLoading={(isLoading || !pools) || isInitLoading || externalStatsLoading}
            aggregatedAdjustedTotalPoolApr={aggregatedAdjustedTotalPoolApr}
            aggregatedSupply={aggregatedSupply}
          />
          <MobilePools pools={myPools} aggregatedAdjustedTotalPoolApr={aggregatedAdjustedTotalPoolApr}
            aggregatedSupply={aggregatedSupply} />
        </Box>
      )}

      <Box width={'100%'} px={{ base: 5 }}>
        <HStack justifyContent="space-between" width={{ base: 'full',
          xl: 'container.xl' }} paddingTop={10} paddingBottom={5}>
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
                  boxShadow="0px 0px 4px 4px rgba(255, 255, 255, 0.25)"
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
          isLoading={(isLoading || !pools) || isInitLoading || externalStatsLoading}
        />
        <MobilePools pools={showAllPoolsList} ctaLabel="Manage" />
      </Box>
    </VStack>
  )
}

export default Pools
