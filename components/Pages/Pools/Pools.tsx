import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import {
  Box, Button, HStack, Text, VStack, Image, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react'
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

const ActionCTAs = ({chainIdParam}) => {
  const router = useRouter()

  const onClick = () => {
    router.push(`/${chainIdParam}/pools/incentivize`)
  }
  return (
    <HStack spacing={2} >
      <Button variant="outline" size="sm"> Manage Liquidity</Button>
      <Button variant="outline" size="sm" onClick={onClick}> Incentivize</Button>
    </HStack>
  )
}

const IncentivesLogos = () => (
  <HStack spacing={1} borderBottom="1px dashed rgba(255, 255, 255, 0.5)" pb="2">
    <HStack spacing="-23" >
      <Box
        boxShadow="lg"
        borderRadius="full"
        position="relative"
        p="5px"
        bg="black"
        zIndex={1}
      >
        <Image
          src="/logos/atom.png"
          width="auto"
          maxW="1.6rem"
          maxH="1.6rem"
          alt="token1-img"
        />
      </Box>
      <Box
        borderRadius="full"
        p="4px"
        border="1px solid rgba(255, 255, 255, 0.1)"
        m="-10"
        zIndex={2}
      // style={{ marginLeft: '-25px' }}
      >
        <Image
          src="/logos/axlUSDC.png"
          width="auto"
          maxW="1.6rem"
          maxH="1.6rem"
          alt="token2-img"
        />
      </Box>
      <Box
        borderRadius="full"
        p="4px"
        border="1px solid rgba(255, 255, 255, 0.1)"
        zIndex={3}
      // style={{ marginLeft: '-25px' }}
      >
        <Image
          src="/logos/astro.png"
          width="auto"
          maxW="1.6rem"
          maxH="1.6rem"
          alt="token2-img"
        />
      </Box>
    </HStack>
    <Text fontSize="sm" >+ 5</Text>
  </HStack>
)

const Incentives = () => {
  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <Button variant="unstyled">
          <IncentivesLogos />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        background="black"
        boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
        borderRadius="15px"
        border="unset"
        width="auto"
      >
        <PopoverArrow
          bg="black"
          boxShadow="unset"
          style={{ boxShadow: 'unset' }}
          sx={{ '--popper-arrow-shadow-color': 'black' }}
        />
        <PopoverBody

        >
          <TableContainer>
            <Table size='sm' variant="unstyled">
              <Thead >
                <Tr border="0">
                  <Td color="gray.500">Token</Td>
                  <Td color="gray.500">Estimate Daily Reward</Td>
                  <Td color="gray.500" isNumeric>APR</Td>
                </Tr>
              </Thead>
              <Tbody>
                <Tr borderBottom={"1px solid rgba(255, 255, 255, 0.1)"}>
                  <Td>ATOM</Td>
                  <Td>109</Td>
                  <Td isNumeric>0.04%</Td>
                </Tr>
                <Tr borderBottom={"1px solid rgba(255, 255, 255, 0.1)"}>
                  <Td>JUNO</Td>
                  <Td>109</Td>
                  <Td isNumeric>0.04%</Td>
                </Tr>
                <Tr borderBottom={"1px solid rgba(255, 255, 255, 0.1)"}>
                  <Td>WHALE</Td>
                  <Td>109</Td>
                  <Td isNumeric>0.04%</Td>
                </Tr>
                <Tr>
                  <Td>USDC</Td>
                  <Td>109</Td>
                  <Td isNumeric>0.04%</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {}

const commingSoonNetworks = ['chihuahua', 'injective', 'comdex']
const subqueryNetorks = ['injective']
const COMING_SOON = 'coming soon'
const NoPrice = ['ASH-BDOG', 'ASH-GDOG']

const Pools: FC<Props> = () => {
  const [allPools, setAllPools] = useState<any[]>([])
  const [isInitLoading, setInitLoading] = useState<boolean>(true)
  const { address, chainId } = useRecoilValue(walletState)
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

  const calcuateTotalLiq = (pool) => {
    return NoPrice.includes(pool?.pool_id)
      ? 'NA'
      : pool?.usdLiquidity || pool.liquidity?.available?.total?.dollarValue
  }

  const calculateMyPostion = (pool) => {
    const totalLiq = calcuateTotalLiq(pool)
    const { provided, total, staked } = pool.liquidity?.available || {}
    const { provided: stakedProvided } = pool.liquidity?.staked || {}
    const totalLP = Number(provided?.tokenAmount) + Number(stakedProvided?.tokenAmount || 0)
    return num(totalLP)
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
    const poosWithAprAnd24HrVolume = await getPairAprAndDailyVolume(
      pools,
      chainId
    )
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
        const displayAssetOrder = pool.displayName?.split('-')
        const isUSDPool =
          STABLE_COIN_LIST.includes(pool?.pool_assets[0].symbol) ||
          STABLE_COIN_LIST.includes(pool?.pool_assets[1].symbol)
        const pairInfos = pool.liquidity.reserves.total
        const asset0Balance = pairInfos[0] / 10 ** pool.pool_assets[0].decimals
        const asset1Balance = pairInfos[1] / 10 ** pool.pool_assets[1].decimals
        let price = 0
        if (displayAssetOrder?.[0] === pool.assetOrder?.[0]) {
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
          incentives: <Incentives />,
          action: <ActionCTAs chainIdParam={chainIdParam} />,
          cta: () => {
            const [asset1, asset2] = pool?.pool_id.split('-') || []
            router.push(
              `/${chainIdParam}/pools/manage_liquidity?poolId=${pool?.pool_id}`
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
