import { FC, useEffect, useMemo, useState } from 'react'

import { Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { TokenBalance } from 'components/Pages/Dashboard/BondingActions/Bond'
import { BondedData } from 'components/Pages/Dashboard/hooks/getBonded'
import { UnbondingData } from 'components/Pages/Dashboard/hooks/getUnbonding'
import { WithdrawableInfo } from 'components/Pages/Dashboard/hooks/getWithdrawable'
import { WHALE_TOKEN_SYMBOL } from 'constants/index'
import { useChains } from 'hooks/useChainInfo'
import usePrices from 'hooks/usePrices'
import { useMultipleTokenBalance } from 'hooks/useTokenBalance'
import { useRecoilState } from 'recoil'
import { WalletStatusType, walletState } from 'state/atoms/walletAtoms'

import BondingOverview, { ActionType, TokenType } from './BondingOverview'
import { Config, useConfig, useDashboardData } from './hooks/useDashboardData'
import RewardsComponent from './RewardsComponent'
import { BondingData } from './types/BondingData'

const Dashboard: FC = () => {
  const [{ chainId, status, client, address, network }] =
    useRecoilState(walletState)
  const isWalletConnected: boolean = status === WalletStatusType.connected
  const chains: Array<any> = useChains()
  const currentChain = chains.find((row: { chainId: string }) => row.chainId === chainId)
  const currentChainName = currentChain?.label.toLowerCase()

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

  const setValues = (
    tokenType: TokenType,
    value: number,
    tokenBalances: TokenBalance[],
  ) => {
    const specificBondingData = data?.find((e) => e.tokenType == tokenType)
    specificBondingData.value = value ?? 0
    specificBondingData.tokenBalances = tokenBalances ?? []
  }
  const setBondedTokens = function (bondedAssets: BondedData[]) {
    const tokenBalances = bondedAssets?.map((asset: BondedData) => ({ amount: asset.amount,
      tokenSymbol: asset.tokenSymbol }))
    const total = tokenBalances?.reduce((acc, e) => acc + e.amount, 0)
    setValues(
      TokenType.bonded, total, tokenBalances,
    )
  }
  const setLiquidTokens = function (liquidBalances: number[],
    symbols: string[]) {
    const tokenBalances = symbols?.map((symbol, idx) => ({
      amount: liquidBalances?.[idx] ?? 0,
      tokenSymbol: symbol,
    }))
    const total = tokenBalances?.reduce((acc, e) => acc + e.amount, 0)
    setValues(
      TokenType.liquid, total, tokenBalances,
    )
  }

  const setUnbondingTokens = function (unbondingRequests: UnbondingData[]) {
    const tokenBalances = unbondingRequests?.map((req) => ({ amount: req.amount,
      tokenSymbol: req.tokenSymbol }))
    const total = tokenBalances?.reduce((acc, e) => acc + e.amount, 0)

    setValues(
      TokenType.unbonding, total, tokenBalances,
    )
  }

  const setWithdrawableTokens = function (withdrawableInfos: WithdrawableInfo[]) {
    const tokenBalances = withdrawableInfos?.map((info) => ({ amount: info.amount,
      tokenSymbol: info.tokenSymbol }))
    const total = tokenBalances?.reduce((acc, e) => acc + e.amount, 0)

    setValues(
      TokenType.withdrawable, total, tokenBalances,
    )
  }

  const prices = usePrices()

  const whalePrice = useMemo(() => {
    // @ts-ignore
    if (prices && prices?.WHALE) {
      // @ts-ignore
      return prices?.WHALE
    }
    return 0 // Default value
  }, [prices])

  const config: Config = useConfig(network, chainId)

  const symbols = useMemo(() => [
    ...(config?.bonding_tokens?.map((token) => token.tokenSymbol) ?? []),
    WHALE_TOKEN_SYMBOL,
  ],
  [config])

  const [liquidBalances, _] = useMultipleTokenBalance(symbols)

  const {
    feeDistributionConfig,
    globalTotalBonded,
    localTotalBonded,
    bondedAssets,
    withdrawableInfos,
    unbondingRequests,
    weightInfo,
    annualRewards,
    currentEpoch,
    totalGlobalClaimable,
    daysSinceLastClaim,
    globalAvailableRewards,
    isLoading,
  } = useDashboardData(
    client, address, network, chainId,
  )

  useEffect(() => {
    setBondedTokens(bondedAssets)
    setLiquidTokens(liquidBalances, symbols)
    setUnbondingTokens(unbondingRequests)
    setWithdrawableTokens(withdrawableInfos)
    setData(data)
  }, [
    isWalletConnected,
    isLoading,
    unbondingRequests,
    bondedAssets,
    withdrawableInfos,
    liquidBalances,
    symbols,
  ])

  return (
    <VStack alignSelf="center">
      <Flex
        direction={{ base: 'column',
          xl: 'row' }}
        gap={10}
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <VStack>
          <HStack width="full" paddingY={5}>
            <Text as="h2" fontSize="24" fontWeight="900">
              Bonding
            </Text>
          </HStack>
          <BondingOverview
            isWalletConnected={isWalletConnected}
            isLoading={isLoading && isWalletConnected}
            data={updatedData}
            whalePrice={whalePrice}
            currentChainName={currentChainName}
          />
        </VStack>
        <VStack alignSelf={{ base: 'center',
          xl: 'end' }}>
          <RewardsComponent
            isWalletConnected={isWalletConnected}
            whalePrice={whalePrice}
            currentEpoch={currentEpoch}
            isLoading={isLoading && isWalletConnected}
            localTotalBonded={localTotalBonded}
            globalTotalBonded={globalTotalBonded}
            feeDistributionConfig={feeDistributionConfig}
            annualRewards={annualRewards}
            globalAvailableRewards={globalAvailableRewards}
            totalGlobalClaimable={totalGlobalClaimable}
            daysSinceLastClaim={daysSinceLastClaim}
            weightInfo={weightInfo}
          />
        </VStack>
      </Flex>
    </VStack>
  )
}

export default Dashboard
