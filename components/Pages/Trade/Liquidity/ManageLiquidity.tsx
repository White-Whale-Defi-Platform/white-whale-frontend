import { FC, useEffect, useMemo, useState } from 'react'

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
import Claim from 'components/Pages/Trade/Liquidity/Claim'
import DepositForm from 'components/Pages/Trade/Liquidity/DepositForm'
import useProvideLP from 'components/Pages/Trade/Liquidity/hooks/useProvideLP'
import Overview from 'components/Pages/Trade/Liquidity/Overview'
import WithdrawForm from 'components/Pages/Trade/Liquidity/WithdrawForm'
import { useChains2 } from 'hooks/useChainInfo'
import { useClients } from 'hooks/useClients'
import usePrices from 'hooks/usePrices'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { NextRouter, useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import {
  PoolEntityTypeWithLiquidity,
  useQueryPoolsLiquidity,
} from 'queries/useQueryPoolsLiquidity'
import { useRecoilState, useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { tokenItemState } from 'state/tokenItemState'
import { TxStep } from 'types/common'
import { PositionsOverview } from 'components/Pages/Trade/Incentivize/PositionsOverview';

const ManageLiquidity: FC = () => {
  const [isMobile] = useMediaQuery('(max-width: 640px)')
  const router: NextRouter = useRouter()
  const chains: Array<any> = useChains2()
  const { address, chainId, walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(walletChainName)
  const [reverse, setReverse] = useState<boolean>(false)
  const [isTokenSet, setIsToken] = useState<boolean>(false)
  const { data: poolList } = usePoolsListQuery()
  const [[tokenA, tokenB], setTokenLPState] = useRecoilState(tokenItemState)
  const [bondingDays, setBondingDays] = useState(0)
  const { simulated, tx } = useProvideLP({ reverse,
    bondingDays })
  const { cosmWasmClient } = useClients(walletChainName)

  const [pools]: readonly [PoolEntityTypeWithLiquidity[], boolean, boolean] =
    useQueriesDataSelector(useQueryPoolsLiquidity({
      refetchInBackground: false,
      pools: poolList?.pools,
      cosmWasmClient,
    }))
  const poolId = (router.query.poolId as string) ?? poolList?.pools[0].pool_id
  const prices = usePrices()
  const currentChainPrefix = useMemo(() => chains.find((row) => row.chainId === chainId)?.bech32Config?.
    bech32PrefixAccAddr,
  [chains, chainId])
  const { flowPoolData: incentivePoolInfos } = useIncentivePoolInfo(
    cosmWasmClient,
    pools,
    currentChainPrefix,
  )

  const pool = useMemo(() => poolList?.pools.find((pool: any) => pool.pool_id === poolId),
    [poolId, poolList])
  // TODO pool user share might be falsy
  const poolUserShare = usePoolUserShare(
    cosmWasmClient,
    pool?.staking_address,
    address,
  )

  const dailyEmissionData = useMemo(() => {
    const incentivePoolInfo = incentivePoolInfos?.find((info) => info.poolId === poolId)
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
  }, [prices, incentivePoolInfos, poolId, poolUserShare])
  const chainIdParam = router.query.chainId as string
  const currentChain = chains.find((row) => row.chainId === chainId)

  // TODO default query param in url when no poolId is provided
  useEffect(() => {
    if (currentChain) {
      if (poolId) {
        const pools = poolList?.pools
        if (pools && !pools.find((pool: any) => pool.pool_id === poolId)) {
          router.push(`/${currentChain.label.toLowerCase()}/pools`)
        } else {
          router.push(`/${currentChain.label.toLowerCase()}/pools/manage_liquidity?poolId=${poolId}`)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolId, poolList, currentChain])

  useEffect(() => {
    if (poolId) {
      const [tokenASymbol, tokenBSymbol] = poolId?.split('-')
      setTokenLPState([
        {
          tokenSymbol: tokenASymbol,
          amount: 0,
          decimals: 6,
        },
        {
          tokenSymbol: tokenBSymbol,
          amount: 0,
          decimals: 6,
        },
      ])
      setIsToken(true)
    }
    return () => {
      setTokenLPState([
        {
          tokenSymbol: null,
          amount: 0,
          decimals: 6,
        },
        {
          tokenSymbol: null,
          amount: 0,
          decimals: 6,
        },
      ])
      setIsToken(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId])

  const clearForm = () => {
    console.log('clearform')
    setTokenLPState([
      {
        ...tokenA,
        amount: 0,
      },
      {
        ...tokenB,
        amount: 0,
      },
    ])
    tx.reset()
  }

  const onInputChange = ({ tokenSymbol, amount }: any, index: number) => {
    console.log(tx.txStep)
    console.log(tx?.txStep === TxStep.Success)
    if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success) {
      console.log('yes')
      tx.reset()
    }

    const newState: any = [tokenA, tokenB]
    newState[index] = {
      tokenSymbol,
      amount: Number(amount),
    }
    setTokenLPState(newState)
  }

  const myFlows = useMemo(() => {
    if (!pools || !poolId) {
      return []
    }

    const flows = pools.find((p) => p.pool_id === poolId)
    return flows?.liquidity?.myFlows || []
  }, [pools, poolId])

  return (
    <VStack
      w="auto"
      minWidth={{ base: '100%',
        md: '800' }}
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
        background={'#1C1C1C'}
        padding={[6, 12]}
        borderRadius="30px"
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
              background={'#1C1C1C'}
            >
              <Tab>Overview</Tab>
              <Tab>Deposit</Tab>
              <Tab>Withdraw</Tab>
              <Tab>Claim</Tab>
              {dailyEmissionData.length > 0 ? <Tab>Incentives</Tab> : null}
            </TabList>
            <TabPanels p={4}>
              <TabPanel padding={4}>
                <Overview poolId={poolId} dailyEmissions={dailyEmissionData} />
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
                    poolId={poolId}
                    mobile={isMobile}
                  />
                )}
              </TabPanel>
              <TabPanel padding={4}>
                <WithdrawForm
                  isWalletConnected={isWalletConnected}
                  clearForm={clearForm}
                  poolId={poolId}
                  mobile={isMobile}
                />
              </TabPanel>
              <TabPanel padding={4}>
                <Claim poolId={poolId} />
              </TabPanel>
              {dailyEmissionData.length > 0 ? (
                <TabPanel padding={4}>
                  <PositionsOverview flows={myFlows} poolId={poolId} />
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
