import { FC, useEffect, useState } from 'react'

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
import { TxStep } from 'hooks/useTransaction'
import { NextRouter, useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'

import useProvideLP from '../NewPosition/hooks/useProvideLP'
import DepositForm from './DepositForm'
import { tokenLpAtom } from './lpAtoms'
import WithdrawForm from './WithdrawForm'

const ManageLiquidity: FC = () => {
  const router: NextRouter = useRouter()
  const chains = useChains()
  const { address, chainId, status } = useRecoilValue(walletState)
  const [reverse, setReverse] = useState<boolean>(false)
  const [isTokenSet, setIsToken] = useState<boolean>(false)
  const { data: poolList } = usePoolsListQuery()
  const [[tokenA, tokenB], setTokenLPState] = useRecoilState(tokenLpAtom)
  const { simulated, tx } = useProvideLP({ reverse })

  const poolId = router.query.poolId as string
  const chainIdParam = router.query.chainId as string
  const currenChain = chains.find((row) => row.chainId === chainId)

  useEffect(() => {
    if (currenChain) {
      if (poolId) {
        const pools = poolList?.pools
        if (pools && !pools.find((pool: any) => pool.pool_id === poolId)) {
          router.push(`/${currenChain.label.toLowerCase()}/pools`)
        } else {
          router.push(
            `/${currenChain.label.toLowerCase()}/pools/manage_liquidity?poolId=${poolId}`
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
      width={{ base: '100%', md: '700px' }}
      alignItems="center"
      padding={5}
      // margin="auto"
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
          maxW="600px"
          maxH="fit-content"
        >
          <Tabs variant="brand">
            <TabList justifyContent="center" background="#1C1C1C">
              <Tab>Deposit</Tab>
              <Tab>Withdraw</Tab>
            </TabList>
            <TabPanels>
              <TabPanel padding={4}>
                {isTokenSet && (
                  <DepositForm
                    setReverse={setReverse}
                    reverse={reverse}
                    connected={status}
                    tokenA={tokenA}
                    tokenB={tokenB}
                    onInputChange={onInputChange}
                    simulated={simulated}
                    tx={tx}
                  />
                )}
              </TabPanel>
              <TabPanel padding={4}>
                <WithdrawForm
                  connected={status}
                  tokenA={{
                    tokenSymbol: poolId,
                    amount: 0,
                    decimals: 6,
                  }}
                  poolId={poolId}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </VStack>
  )
}

export default ManageLiquidity
