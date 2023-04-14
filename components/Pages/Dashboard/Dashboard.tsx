import {FC, useEffect, useState} from 'react'
import {Flex, HStack, Text, VStack} from '@chakra-ui/react'
import BondingOverview, {ActionType, TokenType} from './BondingOverview'
import RewardsComponent from './RewardsComponent';
import {useRecoilState} from "recoil";
import {walletState, WalletStatusType} from "state/atoms/walletAtoms";
import {BondingData} from "./types/BondingData";
import { useTokenBalance} from "hooks/useTokenBalance";
import {useChains} from "hooks/useChainInfo";
import {useWhalePrice} from "queries/useGetTokenDollarValueQuery";
import {useDashboardData} from "./hooks/useDashboardData";
import {AMP_WHALE_TOKEN_SYMBOL, B_WHALE_TOKEN_SYMBOL, WHALE_TOKEN_SYMBOL} from "constants/bonding_contract";

const Dashboard: FC = () => {
  const [{chainId, status, client, address, network}] = useRecoilState(walletState)
  const isWalletConnected: boolean = status === WalletStatusType.connected
  const chains: Array<any> = useChains()
  const currentChain = chains.find((row: { chainId: string }) => row.chainId === chainId)
  const currentChainName = currentChain?.label.toLowerCase()

  const data: BondingData[] = [
    {
      tokenType: TokenType.liquid,
      value: null,
      whale: null,
      ampWhale: null,
      bWhale: null,
      color: "#244228",
      label: "Liquid",
      actionType: ActionType.buy
    },
    {
      tokenType: TokenType.bonded,
      value: null,
      whale: null,
      ampWhale: null,
      bWhale: null,
      color: "#7CFB7D",
      label: "Bonded",
      actionType: ActionType.bond
    },
    {
      tokenType: TokenType.unbonding,
      value: null,
      whale: null,
      ampWhale: null,
      bWhale: null,
      color: "#3273F6",
      label: "Unbonding",
      actionType: ActionType.unbond
    },
    {
      tokenType: TokenType.withdrawable,
      value: null,
      whale: null,
      ampWhale: null,
      bWhale: null,
      color: "#173E84",
      label: "Withdrawable",
      actionType: ActionType.withdraw
    },
  ];

  const [updatedData, setData] = useState(null)

  const setValues = (tokenType: TokenType, value: number, whale: number, ampWhale: number, bWhale: number) => {
    const specificBondingData = data.find(e => e.tokenType == tokenType)
    specificBondingData.value = value
    specificBondingData.whale = whale
    specificBondingData.ampWhale = ampWhale
    specificBondingData.bWhale = bWhale
  }

  const setBondedTokens = function (ampWhale, bWhale) {
    setValues(TokenType.bonded, (ampWhale + bWhale), null, ampWhale, bWhale)
  }
  const setLiquidTokens = function (whale, ampWhale, bWhale) {
    setValues(TokenType.liquid, (whale + ampWhale + bWhale), whale, ampWhale, bWhale)
  }

  const setUnbondingTokens = function (ampWhale, bWhale) {
    setValues(TokenType.unbonding, (ampWhale + bWhale), null, ampWhale, bWhale)
  }

  const setWithdrawableTokens = function (ampWhale, bWhale) {
    setValues(TokenType.withdrawable, (ampWhale + bWhale), null, ampWhale, bWhale)
  }

  const whalePrice = useWhalePrice()

  // const [balances, balancesLoading] =  useMultipleTokenBalance(["WHALE", "ampWHALE", "bWHALE"])
  //
  // const liquidWhale = balances?.[0]
  // const liquidAmpWhale = balances?.[1]
  // const liquidBWhale = balances?.[2]

  const {balance: liquidWhale,isLoading: liquidWhaleLoading} = useTokenBalance(
    WHALE_TOKEN_SYMBOL)
  const {balance: liquidAmpWhale, isLoading: liquidAmpLoading} = useTokenBalance(
    AMP_WHALE_TOKEN_SYMBOL)
  const {balance: liquidBWhale,isLoading: liquidBLoading} = useTokenBalance(
    B_WHALE_TOKEN_SYMBOL)

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
    currentEpoch,
    annualRewards,
    claimable: claimableRewards,
    globalAvailableRewards,
    isLoading,
  } = useDashboardData(client, address, network, chainId)

  const [isLoadingSummary, setLoading] = useState<boolean>(true)

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading])

  useEffect(() => {
    setBondedTokens(bondedAmpWhale, bondedBWhale);
    setLiquidTokens(liquidWhale, liquidAmpWhale, liquidBWhale);
    setUnbondingTokens(unbondingAmpWhale, unbondingBWhale);
    setWithdrawableTokens(withdrawableAmpWhale, withdrawableBWhale);
    setData(data)
  }, [isWalletConnected, isLoadingSummary]);

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
            isLoading={isLoadingSummary && isWalletConnected}
            data={updatedData}
            whalePrice={whalePrice}
            currentChainName={currentChainName}
          />
        </VStack>
        <VStack alignSelf={{ base: "center", xl: "end" }}>
        <RewardsComponent
          isWalletConnected={isWalletConnected}
          whalePrice={whalePrice}
          isLoading={isLoadingSummary && isWalletConnected}
          localTotalBonded={localTotalBonded}
          globalTotalBonded={globalTotalBonded}
          feeDistributionConfig={feeDistributionConfig}
          currentEpoch={currentEpoch}
          annualRewards={annualRewards}
          globalAvailableRewards={globalAvailableRewards}
          claimableRewards={claimableRewards}
          weightInfo={weightInfo}
        />
        </VStack>
      </Flex>
    </VStack>
  );
};

export default Dashboard