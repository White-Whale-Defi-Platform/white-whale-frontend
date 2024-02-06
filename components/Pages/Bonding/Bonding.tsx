import { FC, useEffect, useMemo, useState } from 'react'

import { ChevronDownIcon } from '@chakra-ui/icons'
import { Button, Flex, HStack, Text, useDisclosure, useMediaQuery, VStack, Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton, 
  Stack} from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import Loader from 'components/Loader'
import { TokenBalance } from 'components/Pages/Bonding/BondingActions/Bond'
import { BondedData } from 'components/Pages/Bonding/hooks/getBonded'
import { UnbondingData } from 'components/Pages/Bonding/hooks/getUnbonding'
import { WithdrawableInfo } from 'components/Pages/Bonding/hooks/getWithdrawable'
import { WHALE_TOKEN_SYMBOL } from 'constants/index'
import { useMultipleTokenBalance } from 'hooks/useTokenBalance'
import { useWhalePrice } from 'hooks/useWhalePrice'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import BondingOverview, { ActionType, TokenType } from './BondingOverview'
import { Config, useConfig, useDashboardData } from './hooks/useDashboardData'
import RewardsComponent from './RewardsComponent'
import { BondingData } from './types/BondingData'

const Bonding: FC = () => {
  const { chainId, chainName, network, walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected, address } = useChain(walletChainName)

  const data: BondingData[] = [
    {
      tokenType: TokenType.liquid,
      value: null,
      tokenBalances: [],
      color: '#244228',
      label: 'Liquid',
      actionType: ActionType.buy,
    },
    {
      tokenType: TokenType.bonded,
      value: null,
      tokenBalances: [],
      color: '#7CFB7D',
      label: 'Bonded',
      actionType: ActionType.bond,
    },
    {
      tokenType: TokenType.unbonding,
      value: null,
      tokenBalances: [],
      color: '#3273F6',
      label: 'Unbonding',
      actionType: ActionType.unbond,
    },
    {
      tokenType: TokenType.withdrawable,
      value: null,
      tokenBalances: [],
      color: '#173E84',
      label: 'Withdrawable',
      actionType: ActionType.withdraw,
    },
  ]

  const [updatedData, setData] = useState(null)
  const [isMobile] = useMediaQuery('(max-width: 720px)')

  const setValues = (
    tokenType: TokenType,
    value: number,
    tokenBalances: TokenBalance[],
  ) => {
    const specificBondingData = data.find((e) => e.tokenType === tokenType)
    specificBondingData.value = value ?? 0
    specificBondingData.tokenBalances = tokenBalances ?? []
  }
  const setBondedTokens = (bondedAssets: BondedData[]) => {
    const tokenBalances = bondedAssets?.map((asset: BondedData) => ({ amount: asset.amount,
      tokenSymbol: asset.tokenSymbol }))
    const total = tokenBalances?.reduce((acc, e) => acc + e.amount, 0)
    setValues(
      TokenType.bonded, total, tokenBalances,
    )
  }
  const setLiquidTokens = (liquidBalances: number[],
    symbols: string[]) => {
    const tokenBalances = symbols?.map((symbol, idx) => ({
      amount: liquidBalances?.[idx] ?? 0,
      tokenSymbol: symbol,
    }))
    const total = tokenBalances?.reduce((acc, e) => acc + e.amount, 0)
    setValues(
      TokenType.liquid, total, tokenBalances,
    )
  }

  const setUnbondingTokens = (unbondingRequests: UnbondingData[]) => {
    const tokenBalances = unbondingRequests?.map((req) => ({ amount: req.amount,
      tokenSymbol: req.tokenSymbol }))
    const total = tokenBalances?.reduce((acc, e) => acc + e.amount, 0)

    setValues(
      TokenType.unbonding, total, tokenBalances,
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const setWithdrawableTokens = (withdrawableInfos: WithdrawableInfo[]) => {
    const tokenBalances = withdrawableInfos?.map((info) => ({ amount: info.amount,
      tokenSymbol: info.tokenSymbol }))
    const total = tokenBalances?.reduce((acc, e) => acc + e.amount, 0)

    setValues(
      TokenType.withdrawable, total, tokenBalances,
    )
  }

  const whalePrice = useWhalePrice()

  const config: Config = useConfig(network, chainId)

  const symbols = useMemo(() => {
    const tokenSymbols = config?.bonding_tokens?.map((token) => token.symbol) || [];
    return Array.from(new Set([...tokenSymbols, WHALE_TOKEN_SYMBOL]));
  }, [config])

  const [liquidBalances, _] = useMultipleTokenBalance(symbols)

  const {
    feeDistributionConfig,
    myTotalBonding,
    myBondedAssets,
    withdrawableInfos,
    unbondingRequests,
    weightInfo,
    annualRewards,
    currentEpoch,
    totalGlobalClaimable,
    lastClaimedTime,
    globalAvailableRewards,
    globalIndexInfo,
    isLoading,
  } = useDashboardData(
    address, network, chainId, walletChainName,
  )

  useEffect(() => {
    setBondedTokens(myBondedAssets)
    setLiquidTokens(liquidBalances, symbols)
    setUnbondingTokens(unbondingRequests)
    setWithdrawableTokens(withdrawableInfos)
    setData(data)
  }, [
    isWalletConnected,
    isLoading,
    unbondingRequests,
    myBondedAssets,
    withdrawableInfos,
    liquidBalances,
    symbols,
  ])
  const { isOpen, onOpen, onClose } = useDisclosure()
  return <>{isLoading && isWalletConnected ?
    <HStack
      width="full"
      alignContent="center"
      justifyContent="center"
      alignItems="center">
      <Loader />
    </HStack> : (
      <VStack width={'full'} alignSelf="center" paddingLeft={['5', '5', '10']}>
        <Flex
          direction={{
            base: 'column',
            xl: 'row',
          }}
          gap={5}
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <VStack width="flex">
            <HStack width="full" paddingY={{
              base: 3,
              md: 5,
            }}>
              <Stack direction={['column', 'row']} >
                <Text as="h2" fontSize="24" fontWeight="900" paddingLeft={5}>
              Bonding - Earn swap fees with ampWhale or bWhale.
                </Text>
                <Button
                  variant="link"
                  color="white"
                  fontSize={20}
                  textDecoration={'underline'}
                  onClick={onOpen}>
                  How it works
                </Button>
                <ChevronDownIcon mt={1} ml={-1} fontSize={24} color="white" />
              </Stack>
            </HStack>
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>How Bonding Works</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text>• Bond to any White Whale satellite DEX to earn a share of the swap fees of that DEX</Text>
                  <Text>• ampWHALE or bWHALE is required to bond</Text>
                  <Text>• Keeping tokens bonded increases multiplier over time, increasing share of the rewards earned, unbonding resets multiplier</Text>
                  <Text>• 1 day cool down period after unbonding, after which tokens can be withdrawn</Text>
                </ModalBody>
                <ModalFooter>
                  <Button width="full" variant="outline" size="sm" mr={3} onClick={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <BondingOverview
              isWalletConnected={isWalletConnected}
              data={updatedData}
              whalePrice={whalePrice}
              currentChainName={chainName}
              mobile={isMobile}
            />
          </VStack>
          <VStack alignSelf={{
            base: 'center',
            xl: 'end',
          }}>
            <RewardsComponent
              isWalletConnected={isWalletConnected}
              whalePrice={whalePrice}
              currentEpoch={currentEpoch}
              myTotalBonding={myTotalBonding}
              feeDistributionConfig={feeDistributionConfig}
              annualRewards={annualRewards}
              globalAvailableRewards={globalAvailableRewards}
              totalGlobalClaimable={totalGlobalClaimable}
              daysSinceLastClaim={lastClaimedTime}
              weightInfo={weightInfo}
              globalInfo={globalIndexInfo}
            />
          </VStack>
        </Flex>
      </VStack>) }</>
}

export default Bonding
