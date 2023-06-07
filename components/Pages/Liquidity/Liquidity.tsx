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
  VStack
} from '@chakra-ui/react'
import { useChains } from 'hooks/useChainInfo'
import { TxStep } from 'types/common'
import { NextRouter, useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { FC, useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import Claim from './Claim'
import DepositForm from './DepositForm'
import useProvideLP from './hooks/useProvideLP'
import { tokenLpAtom } from './lpAtoms'
import Overview from './Overview'
import WithdrawForm from './WithdrawForm'

const ManageLiquidity: FC = () => {
  const router: NextRouter = useRouter()
  const chains: Array<any> = useChains()
  const { address, chainId, status } = useRecoilValue(walletState)
  const [reverse, setReverse] = useState<boolean>(false)
  const [isTokenSet, setIsToken] = useState<boolean>(false)
  const { data: poolList } = usePoolsListQuery()
  const [[tokenA, tokenB], setTokenLPState] = useRecoilState(tokenLpAtom)
  const [bondingDays, setBondingDays] = useState(0)
  const { simulated, tx } = useProvideLP({ reverse, bondingDays })

  const poolId = router.query.poolId as string
  const chainIdParam = router.query.chainId as string
  const currentChain = chains.find((row) => row.chainId === chainId)

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
  }, [chainId, poolId, poolList, address, chains])

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
    setTokenLPState([{
      ...tokenA,
      amount: 0
    }, {
      ...tokenB,
      amount: 0
    }
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
      width={{ base: '100%', md: 'auto' }}
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
        background="#1C1C1C"
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
            <TabList justifyContent="center" background="#1C1C1C">
              <Tab>Overview</Tab>
              <Tab>Deposit</Tab>
              <Tab>Withdraw</Tab>
              <Tab>Claim</Tab>
            </TabList>
            <TabPanels p={4}>
              <TabPanel padding={4}>
                <Overview
                  poolId={poolId}
                />
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
                    poolId={poolId}
                    tx={tx}
                    clearForm={clearForm}
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
