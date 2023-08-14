import { FC, useEffect, useMemo, useState } from 'react'
import { Flex, HStack, Text, VStack } from '@chakra-ui/react'
import {
  AMP_WHALE_TOKEN_SYMBOL,
  B_WHALE_TOKEN_SYMBOL,
  WHALE_TOKEN_SYMBOL,
} from 'constants/index'
import usePrices from 'hooks/usePrices'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import BondingOverview, { ActionType, TokenType } from './BondingOverview'
import { useDashboardData } from './hooks/useDashboardData'
import RewardsComponent from './RewardsComponent'
import { BondingData } from './types/BondingData'
import { useChain } from '@cosmos-kit/react-lite'

const Dashboard: FC = () => {
  const { chainId, chainName, network } = useRecoilValue(chainState)

  const { isWalletConnected, address } = useChain(chainName)

  const data: BondingData[] = [
    {
      tokenType: TokenType.liquid,
      value: null,
      whale: null,
      ampWhale: null,
      bWhale: null,
      color: '#244228',
      label: 'Liquid',
      actionType: ActionType.buy,
    },
    {
      tokenType: TokenType.bonded,
      value: null,
      whale: null,
      ampWhale: null,
      bWhale: null,
      color: '#7CFB7D',
      label: 'Bonded',
      actionType: ActionType.bond,
    },
    {
      tokenType: TokenType.unbonding,
      value: null,
      whale: null,
      ampWhale: null,
      bWhale: null,
      color: '#3273F6',
      label: 'Unbonding',
      actionType: ActionType.unbond,
    },
    {
      tokenType: TokenType.withdrawable,
      value: null,
      whale: null,
      ampWhale: null,
      bWhale: null,
      color: '#173E84',
      label: 'Withdrawable',
      actionType: ActionType.withdraw,
    },
  ]

  const [updatedData, setData] = useState(null)

  const setValues = (
    tokenType: TokenType,
    value: number,
    whale: number,
    ampWhale: number,
    bWhale: number
  ) => {
    const specificBondingData = data.find((e) => e.tokenType == tokenType)
    specificBondingData.value = value
    specificBondingData.whale = whale
    specificBondingData.ampWhale = ampWhale
    specificBondingData.bWhale = bWhale
  }

  const setBondedTokens = function (ampWhale, bWhale) {
    setValues(TokenType.bonded, ampWhale + bWhale, null, ampWhale, bWhale)
  }
  const setLiquidTokens = function (whale, ampWhale, bWhale) {
    setValues(
      TokenType.liquid,
      whale + ampWhale + bWhale,
      whale,
      ampWhale,
      bWhale
    )
  }

  const setUnbondingTokens = function (ampWhale, bWhale) {
    setValues(TokenType.unbonding, ampWhale + bWhale, null, ampWhale, bWhale)
  }

  const setWithdrawableTokens = function (ampWhale, bWhale) {
    setValues(TokenType.withdrawable, ampWhale + bWhale, null, ampWhale, bWhale)
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

  const { balance: liquidWhale } = useTokenBalance(WHALE_TOKEN_SYMBOL)
  const { balance: liquidAmpWhale } = useTokenBalance(AMP_WHALE_TOKEN_SYMBOL)
  const { balance: liquidBWhale } = useTokenBalance(B_WHALE_TOKEN_SYMBOL)

  const {
    feeDistributionConfig,
    globalTotalBonded,
    localTotalBonded,
    bondedAmpWhale,
    bondedBWhale,
    unbondingAmpWhale,
    unbondingBWhale,
    withdrawableAmpWhale,
    withdrawableBWhale,
    weightInfo,
    annualRewards,
    currentEpoch,
    totalGlobalClaimable,
    daysSinceLastClaim,
    globalAvailableRewards,
    isLoading,
  } = useDashboardData(address, network, chainId, chainName)

  useEffect(() => {
    setBondedTokens(bondedAmpWhale, bondedBWhale)
    setLiquidTokens(liquidWhale, liquidAmpWhale, liquidBWhale)
    setUnbondingTokens(unbondingAmpWhale, unbondingBWhale)
    setWithdrawableTokens(withdrawableAmpWhale, withdrawableBWhale)
    setData(data)
  }, [isWalletConnected, isLoading, liquidWhale, liquidAmpWhale, liquidBWhale])

  return (
    <VStack alignSelf="center">
      <Flex
        direction={{ base: 'column', xl: 'row' }}
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
            currentChainName={chainName}
          />
        </VStack>
        <VStack alignSelf={{ base: 'center', xl: 'end' }}>
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
