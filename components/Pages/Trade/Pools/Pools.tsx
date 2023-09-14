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
import { Incentives } from 'components/Pages/Trade/Pools/Incentives'
import MobilePools from 'components/Pages/Trade/Pools/MobilePools'
import MyPoolsTable from 'components/Pages/Trade/Pools/MyPoolsTable'
import { ACTIVE_INCENTIVE_NETWORKS, STABLE_COIN_LIST } from 'constants/index'
import { useChains2 } from 'hooks/useChainInfo'
import { useClients } from 'hooks/useClients'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import {
  PoolEntityTypeWithLiquidity,
  useQueryPoolsLiquidity,
} from 'queries/useQueryPoolsLiquidity'
import { useRecoilState, useRecoilValue } from 'recoil'
import { aprHelperState, updateAPRHelperState } from 'state/aprHelperState'
import { chainState } from 'state/chainState'
import { EnigmaPoolData } from 'util/enigma'

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

  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(walletChainName)
  const [_, setAprHelperState] = useRecoilState(aprHelperState)

  const [incentivePoolsLoaded, setIncentivePoolsLoaded] = useState(!ACTIVE_INCENTIVE_NETWORKS.includes(chainId))
  const [showAllPools, setShowAllPools] = useState<boolean>(false)
  const { cosmWasmClient } = useClients(walletChainName)

  const router = useRouter()
  const chainIdParam = router.query.chainId as string
  const { data: poolList } = usePoolsListQuery()
  const [pools, isLoading]: readonly [
    PoolEntityTypeWithLiquidity[],
    boolean,
    boolean
  ] = useQueriesDataSelector(useQueryPoolsLiquidity({
    refetchInBackground: false,
    pools: poolList?.pools,
    cosmWasmClient,
  }))
  const myPoolsLength = useMemo(() => pools?.filter(({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0)?.length,
    [pools])

  const chains: any = useChains2()
  const currentChainPrefix = useMemo(() => chains.find((row: { chainId: string }) => row.chainId === chainId)?.bech32Config?.
    bech32PrefixAccAddr,
  [chains, chainId])

  const {
    flowPoolData: incentivePoolInfos,
    poolsWithAprAnd24HrVolume: pairInfos,
    isLoading: isIncentivePoolInfoLoading,
  } = useIncentivePoolInfo(
    cosmWasmClient, pools, currentChainPrefix,
  )

  // @ts-ignore
  if (window.debugLogsEnabled) {
    console.log('Pools-Liquidity: ', pools)
    console.log('Incentive-Pool-Infos: ', incentivePoolInfos)
    console.log(
      'Loading-Info: ', isLoading, isInitLoading, pairInfos.length === 0,
    )
    console.log('Pools: ', pools)
    console.log('Pair Infos: ', pairInfos)
  }

  const calculateMyPosition = (pool: PoolData) => {
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

      const _allPools = await Promise.all(_pools.map(async (pool) => {
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
      }))
      setAllPools(_allPools)
      if (_allPools.length > 0) {
        setInitLoading(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
    initPools()
  }, [pools, incentivePoolInfos, incentivePoolsLoaded, pairInfos])

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

      updateAPRHelperState(
        pool?.poolId,
        pool?.apr,
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

  useEffect(() => {
    if (myPoolsLength > 0) {
      const myPools = pools.filter(({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0)
      const myPoolIds = myPools.map((pool) => pool.pool_id)
      const updatedPools = allPools.map((pool) => {
        if (myPoolIds.includes(pool.poolId)) {
          return {
            ...pool,
            liquidity: myPools.find((row) => row.pool_id === pool.poolId).
              liquidity,
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
      const pools = allPools.filter(({ liquidity }) => liquidity?.providedTotal?.tokenAmount > 0)
      setMyPools(pools)
    }
  }, [allPools])
  // Get a list of all myPools pools
  const myPoolsId = useMemo(() => myPools?.map(({ pool }) => pool), [myPools])

  const [isLabelOpen, setIsLabelOpen] = useState(false)

  const allPoolsForShown = useMemo(() => allPools?.filter((item) => !myPoolsId?.includes(item.pool)),
    [allPools, myPoolsId])
  const parseLiquidity = (liqString: string) => {
    const value = parseFloat(liqString?.replace(/[^\d.-]/g, ''))
    /*
     * We do this mutation because by now we already have modified the string to include a letter abbreviation
     * if the liquidity goes over 1000
     * If it's in the thousands, multiply the value by 1000, if millions 1000000
     */
    return liqString?.toUpperCase().includes('K')
      ? value * 1_000
      : liqString?.toUpperCase().includes('M')
        ? value * 1_000_000
        : value
  }
  const showAllPoolsList = useMemo(() => {
    const pools = allPoolsForShown
    return showAllPools
      ? pools
      : pools.filter((item) => parseLiquidity(item.totalLiq) > 1000)
  }, [allPoolsForShown, showAllPools])

  return (
    <VStack width={{ base: '100%' }} alignItems="center" margin="auto">
      {myPools?.length > 0 && (
        <Box width={{ base: '100%' }}>
          <Text as="h2" fontSize="24" fontWeight="700" paddingLeft={5}>
          My Pools
          </Text>
          <MyPoolsTable
            show={true}
            pools={myPools}
            isLoading={isLoading || isInitLoading || pairInfos.length === 0}
          />
          <MobilePools pools={myPools} />
        </Box>
      )}

      <Box width={{ base: '100%' }}>
        <HStack justifyContent="space-between" width="full" paddingY={10}>
          <Text as="h2" fontSize="24" fontWeight="700" paddingLeft={5}>
            All Pools
          </Text>
          <Stack direction="row">
            <Tooltip
              label="By default, Pools with less than $1.0k total liquidity will be hidden but optionally can be shown"
              isOpen={isLabelOpen}
            >
              <Text
                as="h6"
                fontSize="14"
                fontWeight="700"
                onMouseEnter={() => setIsLabelOpen(true)}
                onMouseLeave={() => setIsLabelOpen(false)}
                onClick={() => setIsLabelOpen(!isLabelOpen)}
              >
                <InfoOutlineIcon marginRight={2} />
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
        <MobilePools pools={showAllPoolsList} ctaLabel="Manage" />
      </Box>
    </VStack>
  )
}

export default Pools
