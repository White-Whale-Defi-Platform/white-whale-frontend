import {FC, useEffect, useState} from 'react'

import {Flex, HStack, Text, VStack} from '@chakra-ui/react'

import BondingOverview, {ActionType, TokenType} from './BondingOverview'
import RewardsComponent from './RewardsComponent';
import {useRecoilState} from "recoil";
import {walletState, WalletStatusType} from "../../../state/atoms/walletAtoms";
import {BondingData} from "./types/BondingData";
import {useTokenBalance} from "../../../hooks/useTokenBalance";
import {useChains} from "../../../hooks/useChainInfo";
import {useBonded} from "./hooks/useBonded";
import {useUnbonding} from "./hooks/useUnbonding";
import {useWithdrawable} from "./hooks/useWithdrawable";
import {useWhalePrice} from "../../../queries/useGetTokenDollarValueQuery";
import {useTotalBonded} from "./hooks/useTotalBonded";
import {useFeeDistributorConfig} from "./hooks/useFeeDistributorConfig";
import {useCurrentEpoch} from "./hooks/useCurrentEpoch";
import {useClaimableEpochs} from "./hooks/useClaimableEpochs";
import {useClaimable} from "./hooks/useClaimable";
import {useWeight} from "./hooks/useWeight";

const Dashboard: FC = () => {
  const [ _,setScreenWidth] = useState(0);
  const [isHorizontalLayout, setIsHorizontalLayout] = useState(true);
  const [{chainId, status,client, address}] = useRecoilState(walletState)

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
    setValues(TokenType.liquid, (whale + ampWhale + bWhale),whale, ampWhale, bWhale)
  }

  const setUnbondingTokens = function (ampWhale, bWhale) {
    setValues(TokenType.unbonding, (ampWhale + bWhale), null, ampWhale, bWhale)
  }

  const setWithdrawableTokens = function (ampWhale, bWhale) {
    setValues(TokenType.withdrawable, (ampWhale + bWhale),null, ampWhale, bWhale)
  }

  const whalePrice = useWhalePrice()

  const {balance: liquidWhale,isLoading: liquidWhaleLoading} = useTokenBalance(
    "WHALE")
  const {balance: liquidAmpWhale, isLoading: liquidAmpLoading} = useTokenBalance(
    "ampWHALE")
  const {balance: liquidBWhale,isLoading: liquidBLoading} = useTokenBalance(
    "bWHALE")

  const { bondedAmpWhale, bondedBWhale,localTotalBonded, isLoading: bondedInfoLoading,refetch: refetchBonding } = useBonded(client, address);
  const { globalTotalBonded,isLoading: totalBondedLoading } = useTotalBonded(client);
  const { unbondingAmpWhale ,unbondingBWhale ,isLoading: unbondingLoading,refetch: refetchUnbonding } = useUnbonding(client, address);
  const { withdrawableAmpWhale ,withdrawableBWhale ,isLoading: withdrawableLoading,refetch: refetchWithdrawable } = useWithdrawable(client, address);
  // takes ages
  const {feeDistributionConfig, isLoading: feeDistributionConfigLoading } = useFeeDistributorConfig(client);
  // takes ages
  const {currentEpoch, isLoading: currentEpochLoading} = useCurrentEpoch(client);
  const {globalAvailableRewards ,annualRewards, isLoading: globalAvailableRewardsLoading } = useClaimableEpochs(client);
  const {claimable: claimableRewards, isLoading: claimableRewardsLoading} = useClaimable(client, address);
  // takes ages
  const {weightInfo, isLoading: weightInfoLoading} = useWeight(client, address)

  // for debugging
  // console.log("====")
  // console.log(liquidWhaleLoading)
  // console.log(liquidAmpLoading)
  // console.log(liquidBLoading)
  // console.log(bondedInfoLoading)
  // console.log(totalBondedLoading)
  // console.log(unbondingLoading)
  // console.log(withdrawableLoading)
  // console.log(claimableRewardsLoading)
  // console.log(currentEpochLoading)
  // console.log(feeDistributionConfigLoading)
  // console.log(weightInfoLoading)
  // console.log("====")


  useEffect(() => {
    setScreenWidth(window.innerWidth);
    const handleResize = () => {
      setIsHorizontalLayout(window.innerWidth >= 1300);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

useEffect(()=>{
  refetchBonding()
  refetchUnbonding()
  refetchWithdrawable()
}, [address, client])

  const [isLoadingSummary, setLoading] = useState<boolean>(true)

  useEffect(()=>{
    setLoading( liquidWhaleLoading || liquidAmpLoading || liquidBLoading || bondedInfoLoading ||totalBondedLoading || unbondingLoading || withdrawableLoading || globalAvailableRewardsLoading || claimableRewardsLoading || weightInfoLoading || feeDistributionConfigLoading )

  },[ liquidWhaleLoading ,feeDistributionConfigLoading, weightInfoLoading,liquidAmpLoading, liquidBLoading ,bondedInfoLoading,totalBondedLoading,unbondingLoading,withdrawableLoading,currentEpochLoading, globalAvailableRewardsLoading,claimableRewardsLoading])


  useEffect(() => {
      setBondedTokens(bondedAmpWhale, bondedBWhale);
      setLiquidTokens(liquidWhale, liquidAmpWhale, liquidBWhale);
      setUnbondingTokens(unbondingAmpWhale, unbondingBWhale);
      setWithdrawableTokens(withdrawableAmpWhale, withdrawableBWhale);
      setData(data)
  }, [isWalletConnected, isLoadingSummary]);

  return <VStack
    alignSelf="center">
    <Flex
      direction={isHorizontalLayout ? 'row' : 'column'}
      gap={10}
      justifyContent="space-between"
      alignItems="flex-end">
      <VStack>
        <HStack
          width="full"
          paddingY={5}>
          <Text
            as="h2"
            fontSize="24"
            fontWeight="900">
            Bonding
          </Text>
        </HStack>
        <BondingOverview
          isWalletConnected={isWalletConnected}
          isLoading={isLoadingSummary}
          data={updatedData}
          whalePrice={whalePrice}
          currentChainName={currentChainName}/>
      </VStack>
      <RewardsComponent
        isWalletConnected={isWalletConnected}
        whalePrice={whalePrice}
        isLoading={isLoadingSummary}
        localTotalBonded={localTotalBonded}
        globalTotalBonded={globalTotalBonded}
        feeDistributionConfig={feeDistributionConfig}
        currentEpoch={currentEpoch}
        annualRewards={annualRewards}
        globalAvailableRewards={globalAvailableRewards}
        claimableRewards={claimableRewards}
        weightInfo={weightInfo}
        isHorizontalLayout={isHorizontalLayout}/>
    </Flex>
  </VStack>
}
export default Dashboard
