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
} from '@chakra-ui/react'
import { useChains } from 'hooks/useChainInfo'
import { TxStep } from 'types/common'
import { NextRouter, useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { FC, useEffect, useMemo, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import Claim from './Claim'
import DepositForm from './DepositForm'
import useProvideLP from './hooks/useProvideLP'
import { tokenLpAtom } from './lpAtoms'
import Overview from './Overview'
import WithdrawForm from './WithdrawForm'
import { useIncentivePoolInfo } from 'components/Pages/Incentivize/hooks/useIncentivePoolInfo'
import usePrices from 'hooks/usePrices'
import { usePoolUserShare } from 'components/Pages/Incentivize/hooks/usePoolUserShare'
import {
  PoolEntityTypeWithLiquidity,
  useQueryMultiplePoolsLiquidity,
} from 'queries/useQueryPools'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { useCosmwasmClient } from 'hooks/useCosmwasmClient'

const ManageLiquidity: FC = () => {
  const router: NextRouter = useRouter()
  const chains: Array<any> = useChains()
  const { address, chainId, status, client } = useRecoilValue(walletState)
  const [reverse, setReverse] = useState<boolean>(false)
  const [isTokenSet, setIsToken] = useState<boolean>(false)
  const { data: poolList } = usePoolsListQuery()
  const [[tokenA, tokenB], setTokenLPState] = useRecoilState(tokenLpAtom)
  const [bondingDays, setBondingDays] = useState(0)
  const { simulated, tx } = useProvideLP({ reverse, bondingDays })
  const cosmwasmClient = useCosmwasmClient(chainId)

  const [pools]: readonly [PoolEntityTypeWithLiquidity[], boolean, boolean] =
    useQueriesDataSelector(
      useQueryMultiplePoolsLiquidity({
        refetchInBackground: false,
        pools: poolList?.pools,
        client: cosmwasmClient,
      })
    )
  const poolId = (router.query.poolId as string) ?? poolList?.pools[0].pool_id
  const prices = usePrices()
  const currentChainPrefix = useMemo(
    () =>
      chains.find((row) => row.chainId === chainId)?.bech32Config
        ?.bech32PrefixAccAddr,
    [chains, chainId]
  )
  const { flowPoolData: incentivePoolInfos } = useIncentivePoolInfo(
    client,
    pools,
    currentChainPrefix
  )

  const pool = useMemo(
    () => poolList?.pools.find((pool: any) => pool.pool_id === poolId),
    [poolId, poolList]
  )
  //TODO pool user share might be falsy
  const poolUserShare = usePoolUserShare(client, pool?.staking_address, address)

  const dailyEmissionData = useMemo(() => {
    const incentivePoolInfo = incentivePoolInfos?.find(
      (info) => info.poolId === poolId
    )
    if (!poolUserShare) return null
    return (
      incentivePoolInfo?.flowData?.map((data) => {
        const dailyEmission = data.dailyEmission * Number(poolUserShare.share)
        return {
          symbol: data.tokenSymbol,
          dailyEmission: dailyEmission,
          dailyUsdEmission: dailyEmission * prices[data.tokenSymbol],
          denom: data.denom,
        }
      }) ?? []
    )
  }, [prices, incentivePoolInfos, poolId, poolUserShare])
  const chainIdParam = router.query.chainId as string
  const currentChain = chains.find((row) => row.chainId === chainId)

  //TODO default query param in url when no poolId is provided
  useEffect(() => {
    if (currentChain) {
      if (poolId) {
        const pools = poolList?.pools
        if (pools && !pools.find((pool: any) => pool.pool_id === poolId)) {
          router.push(`/${currentChain.label.toLowerCase()}/pools`)
        } else {
          router.push(
            `/${currentChain.label.toLowerCase()}/pools/manage_liquidity?poolId=${poolId}`
          )
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
    if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success)
      tx.reset()

    const newState: any = [tokenA, tokenB]
    newState[index] = {
      tokenSymbol: tokenSymbol,
      amount: Number(amount),
    }
    setTokenLPState(newState)
  }

  return (
    <VStack
      w="auto"
      minWidth={{ base: '100%', md: '800' }}
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
        paddingTop={[10]}
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
          <Tabs variant="brand">
            <TabList justifyContent="center" background={'#1C1C1C'}>
              <Tab>Overview</Tab>
              <Tab>Deposit</Tab>
              <Tab>Withdraw</Tab>
              <Tab>Claim</Tab>
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
                    connected={status}
                    tokenA={tokenA}
                    tokenB={tokenB}
                    onInputChange={onInputChange}
                    simulated={simulated}
                    tx={tx}
                    clearForm={clearForm}
                    chainId={chainId}
                  />
                )}
              </TabPanel>
              <TabPanel padding={4}>
                <WithdrawForm
                  connected={status}
                  clearForm={clearForm}
                  poolId={poolId}
                />
              </TabPanel>
              <TabPanel padding={4}>
                <Claim poolId={poolId} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </VStack>
  )
}

export default ManageLiquidity
