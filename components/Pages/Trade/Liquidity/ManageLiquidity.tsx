import { useEffect, useMemo, useState } from 'react'

import { ArrowBackIcon } from '@chakra-ui/icons'
import {
  Box,
  HStack,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useMediaQuery,
} from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import { useIncentivePoolInfo } from 'components/Pages/Trade/Incentivize/hooks/useIncentivePoolInfo'
import { usePoolUserShare } from 'components/Pages/Trade/Incentivize/hooks/usePoolUserShare'
import { IncentivePositionsOverview } from 'components/Pages/Trade/Incentivize/IncentivePositionsOverview';
import Claim from 'components/Pages/Trade/Liquidity/Claim'
import DepositForm from 'components/Pages/Trade/Liquidity/DepositForm'
import useProvideLP from 'components/Pages/Trade/Liquidity/hooks/useProvideLP'
import Overview from 'components/Pages/Trade/Liquidity/Overview'
import WithdrawForm from 'components/Pages/Trade/Liquidity/WithdrawForm'
import { usePoolsListQuery } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import {
  PoolEntityTypeWithLiquidity,
  useQueryPoolsLiquidity,
} from 'components/Pages/Trade/Pools/hooks/useQueryPoolsLiquidity'
import { ACTIVE_INCENTIVE_NETWORKS } from 'constants/networks'
import { kBg, kBorderRadius } from 'constants/visualComponentConstants'
import { useChainInfos } from 'hooks/useChainInfo'
import { useClients } from 'hooks/useClients'
import { usePrices } from 'hooks/usePrices'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { useTokenList } from 'hooks/useTokenList'
import { useRouter } from 'next/router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { tokenItemState } from 'state/tokenItemState'
import { TokenItemState, TxStep } from 'types/common'
import { getDecimals } from 'util/conversion/index'

import AppLoading from '../../../AppLoading'
import { useFetchLiquidityAlliances } from './hooks/useLiquidityAlliancePositions'
import StakingForm from './StakingForm'

interface ManageLiquidityProps {
  poolIdFromUrl?: string
}
const ManageLiquidity = ({ poolIdFromUrl }: ManageLiquidityProps) => {
  const [poolIdState, setPoolIdState] = useState(null)
  const [isMobile] = useMediaQuery('(max-width: 640px)')
  const router = useRouter()
  const chains: Array<any> = useChainInfos()
  const [tokenList] = useTokenList()
  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected, address, openView } = useChain(walletChainName)
  const [reverse, setReverse] = useState<boolean>(false)
  const [isTokenSet, setIsToken] = useState<boolean>(false)
  const { data: poolData } = usePoolsListQuery()
  const [[tokenA, tokenB], setTokenItemState] = useRecoilState(tokenItemState)
  const [bondingDays, setBondingDays] = useState(0)
  const { simulated, tx } = useProvideLP({
    reverse,
    bondingDays,
  })
  const { data: liquidityAlliances, isLoading } = useFetchLiquidityAlliances()
  const { cosmWasmClient } = useClients(walletChainName)

  const [pools]: readonly [PoolEntityTypeWithLiquidity[], boolean, boolean] =
    useQueriesDataSelector(useQueryPoolsLiquidity({
      refetchInBackground: false,
      pools: poolData?.pools,
      cosmWasmClient,
    }))
  const pool = useMemo(() => pools?.find((p) => p.pool_id === poolIdFromUrl), [pools, poolIdFromUrl])
  const prices = usePrices()
  const currentChainPrefix = useMemo(() => chains.find((row) => row.chainId === chainId)?.bech32Config?.
    bech32PrefixAccAddr,
  [chains, chainId])
  const { flowPoolData: incentivePoolInfos } = useIncentivePoolInfo(
    cosmWasmClient,
    pools,
    currentChainPrefix,
  )

  const alliancePositions = useMemo(() => {
    if (liquidityAlliances) {
      return liquidityAlliances
    }
    return []
  }, [liquidityAlliances, isLoading])

  const isAllianceLP = alliancePositions.find((alliance) => alliance.token === pool?.lp_token)
  const incentivesEnabled = pool?.staking_address && pool?.staking_address !== '' && ACTIVE_INCENTIVE_NETWORKS.includes(chainId) && !isAllianceLP
  const poolUserShare = usePoolUserShare(
    cosmWasmClient,
    pool?.staking_address,
    address,
  )

  const dailyEmissionData = useMemo(() => {
    const incentivePoolInfo = incentivePoolInfos?.find((info) => info.poolId === pool?.pool_id)
    if (!poolUserShare) {
      return null
    }
    return (
      incentivePoolInfo?.flowData?.map((data) => {
        const dailyEmission = data.dailyEmission * Number(poolUserShare.share)
        return {
          symbol: data.tokenSymbol,
          dailyEmission,
          dailyUsdEmission: dailyEmission * prices[data.tokenSymbol],
          denom: data.denom,
        }
      }) ?? []
    )
  }, [prices, incentivePoolInfos, pool, poolUserShare])
  const chainIdParam = router.query.chainId as string
  const chainName = useMemo(() => window.location.pathname.split('/')[1].split('/')[0], [window.location.pathname])

  // @ts-ignore
  if (window.debugLogsEnabled) {
    console.log(
      'ManageLiquidity; Chain Name: ', chainName, ' ', pool?.pool_id,
    )
  }

  useEffect(() => {
    setPoolIdState(pool?.pool_id || poolIdState || poolIdFromUrl)
  }, [pool])

  useEffect(() => {
    if (chainName) {
      if (poolIdState) {
        const pools = poolData?.pools
        if (pools && !pools.find((pool: any) => pool.pool_id === poolIdState)) {
          router.push(`/${chainName.toLowerCase()}/pools`)
        } else {
          router.push(`/${chainName.toLowerCase()}/pools/manage_liquidity?poolId=${poolIdState}`)
        }
      } else {
        if (poolData?.pools) {
          const defaultPoolId = poolData.pools[0].pool_id
          router.push(`/${chainName}/pools/manage_liquidity?poolId=${defaultPoolId}`)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolIdState, poolData, chainName])

  useEffect(() => {
    if (pool?.pool_id) {
      const [tokenASymbol, tokenBSymbol] = pool?.pool_id?.split('-') || []

      setTokenItemState([
        {
          tokenSymbol: tokenASymbol,
          amount: 0,
          decimals: getDecimals(tokenASymbol, tokenList),
        },
        {
          tokenSymbol: tokenBSymbol,
          amount: 0,
          decimals: getDecimals(tokenBSymbol, tokenList),
        },
      ])
      setIsToken(true)
    }
    return () => {
      setTokenItemState([])
      setIsToken(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool])

  const clearForm = () => {
    setTokenItemState([
      {
        ...tokenA,
        amount: 0,
        decimals: getDecimals(tokenA.tokenSymbol, tokenList),
      },
      {
        ...tokenB,
        amount: 0,
        decimals: getDecimals(tokenB.tokenSymbol, tokenList),
      },
    ])
    tx.reset()
  }

  const onInputChange = ({ tokenSymbol, amount }: any, index: number) => {
    if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success) {
      tx.reset()
    }

    const newState: [TokenItemState?, TokenItemState?] = [tokenA, tokenB]
    newState[index] = {
      ...newState.find((item) => item?.tokenSymbol === tokenSymbol),
      tokenSymbol,
      amount: Number(amount),
    }
    setTokenItemState(newState)
  }

  const myFlows = useMemo(() => {
    if (!pools || !pool) {
      return []
    }

    const flows = pools.find((p) => p.pool_id === pool.pool_id)
    return flows?.liquidity?.myFlows || []
  }, [pools, pool, poolIdFromUrl])

  if (!pool) {
    return <AppLoading />
  }

  return (
    <VStack
      w="auto"
      minWidth={{
        base: '100%',
        md: '800',
      }}
      alignItems="center"
      padding={5}
    >
      <HStack
        justifyContent="space-between"
        width="full"
        paddingY={5}
        paddingX={{ base: 4 }}
      >
        <IconButton
          variant="unstyled"
          color="white"
          fontSize="28px"
          aria-label="go back"
          icon={<ArrowBackIcon />}
          onClick={() => router.push(`/${chainIdParam}/pools`)}
        />
        <Text as="h2" fontSize="24" fontWeight="900">
          Manage Liquidity
        </Text>
      </HStack>

      <Box
        background={kBg}
        padding={[6, 12]}
        borderRadius={kBorderRadius}
        width={['full']}
      >
        <Box
          border="2px"
          borderColor="whiteAlpha.200"
          borderRadius="3xl"
          pt="8"
          maxH="fit-content"
        >
          <Tabs variant={'brand'}>
            <TabList
              display={['flex']}
              flexWrap={['wrap']}
              justifyContent="center"
              background={'black'}
              borderRadius={10}
            >
              <Tab>Overview</Tab>
              <Tab>Deposit</Tab>
              {isAllianceLP && (
                <Tab>Stake</Tab>)}
              <Tab>Withdraw</Tab>
              <Tab>Claim</Tab>
              {dailyEmissionData.length > 0 ? <Tab>Incentives</Tab> : null}
            </TabList>
            <TabPanels p={4}>
              <TabPanel padding={4}>
                <Overview pool={pool} dailyEmissions={dailyEmissionData} />
              </TabPanel>
              <TabPanel padding={4}>
                {isTokenSet && (
                  <DepositForm
                    setBondingDays={setBondingDays}
                    bondingDays={bondingDays}
                    setReverse={setReverse}
                    reverse={reverse}
                    isWalletConnected={isWalletConnected}
                    tokenA={tokenA}
                    tokenB={tokenB}
                    onInputChange={onInputChange}
                    simulated={simulated}
                    tx={tx}
                    clearForm={clearForm}
                    chainId={chainId}
                    poolId={poolIdFromUrl}
                    mobile={isMobile}
                    openView={openView}
                    incentivesEnabled={incentivesEnabled}
                  />
                )}
              </TabPanel>
              {isAllianceLP && (
                <TabPanel padding={4}>
                  <StakingForm
                    isWalletConnected={isWalletConnected}
                    clearForm={clearForm}
                    pool={pool}
                    mobile={isMobile}
                    openView={openView}
                  />
                </TabPanel>
              )}
              <TabPanel padding={4}>
                <WithdrawForm
                  isWalletConnected={isWalletConnected}
                  clearForm={clearForm}
                  mobile={isMobile}
                  openView={openView}
                  pool={pool}
                />
              </TabPanel>
              <TabPanel padding={4}>
                <Claim {...pool} />
              </TabPanel>
              {dailyEmissionData.length > 0 ? (
                <TabPanel padding={4}>
                  <IncentivePositionsOverview flows={myFlows} pool={pool} />
                </TabPanel>
              ) : null}
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </VStack>
  )
}

export default ManageLiquidity
