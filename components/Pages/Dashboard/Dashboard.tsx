import { FC, useEffect, useMemo, useState } from 'react'
import { Flex, HStack, Text, VStack,useMediaQuery } from '@chakra-ui/react'
import BondingOverview, { ActionType, TokenType } from './BondingOverview'
import RewardsComponent from './RewardsComponent'
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import { BondingData } from './types/BondingData'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { useChains } from 'hooks/useChainInfo'
import { useDashboardData } from './hooks/useDashboardData'
import { useRouter } from 'next/router'
import {
  AMP_WHALE_TOKEN_SYMBOL,
  B_WHALE_TOKEN_SYMBOL,
  WHALE_TOKEN_SYMBOL,
} from 'constants/bonding_contract'
import usePrices from 'hooks/usePrices'

const Dashboard: FC = () => {
  const router = useRouter()
  const { chainId, status, client, address, network } =
    useRecoilValue(walletState)
  const isWalletConnected: boolean = status === WalletStatusType.connected
  const chains: Array<any> = useChains()
  const currentChain = chains.find(
    (row: { chainId: string }) => row.chainId === chainId
  )
  const currentChainName = currentChain?.label.toLowerCase()
  console.log(currentChainName)
  console.log(status)
 
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
  const [isMobile] = useMediaQuery("(max-width: 720px)") 

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
    if (prices && prices['WHALE']) {
      return prices['WHALE']
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
    globalAvailableRewards,
    isLoading,
  } = useDashboardData(client, address, network, chainId)

  useEffect(() => {
    setBondedTokens(bondedAmpWhale, bondedBWhale)
    setLiquidTokens(liquidWhale, liquidAmpWhale, liquidBWhale)
    setUnbondingTokens(unbondingAmpWhale, unbondingBWhale)
    setWithdrawableTokens(withdrawableAmpWhale, withdrawableBWhale)
    setData(data)
  }, [isWalletConnected, isLoading, liquidWhale, liquidAmpWhale, liquidBWhale])

  return (
    <VStack alignSelf="center" paddingLeft={10}>
      <Flex
        direction={{ base: 'column', xl: 'row' }}
        gap={5}
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <VStack width="flex">
          <HStack width="full" paddingY={5}>
            <Text as="h2" fontSize="24" fontWeight="900" paddingLeft={5}>
              Bonding
            </Text>
          </HStack>
          <BondingOverview
            isWalletConnected={isWalletConnected}
            isLoading={isLoading && isWalletConnected}
            data={updatedData}
            whalePrice={whalePrice}
            currentChainName={currentChainName}
            mobile={isMobile}
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
            weightInfo={weightInfo}
          />
        </VStack>
      </Flex>
    </VStack>
  )
}

export default Dashboard
