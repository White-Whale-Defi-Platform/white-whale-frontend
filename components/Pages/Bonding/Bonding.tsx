import {FC, useEffect, useMemo, useState} from 'react'

import {Flex, HStack, Text, VStack} from '@chakra-ui/react'

import BondingOverview, {ActionType, TokenType} from './BondingOverview'
import RewardsComponent from './RewardsComponent';
import {useRecoilState} from "recoil";
import {walletState, WalletStatusType} from "../../../state/atoms/walletAtoms";
import {BondingData} from "./types/BondingData";
import {usePoolsListQuery} from "../../../queries/usePoolsListQuery";
import {useTokenBalance} from "../../../hooks/useTokenBalance";
import {useChains} from "../../../hooks/useChainInfo";
import {bondingState, BondingStatus} from "../../../state/atoms/bondingAtoms";

const Bonding: FC = () => {
  const [screenWidth, setScreenWidth] = useState(0);
  const [isHorizontalLayout, setIsHorizontalLayout] = useState(true);
  const [{chainId, status}] = useRecoilState(walletState)

  const [currentBondingState, setCurrentBondingState] = useRecoilState(bondingState)

  const isWalletConnected: boolean = status === WalletStatusType.connected
  const chains: Array<any> = useChains()
  const currentChain = chains.find((row: { chainId: string }) => row.chainId === chainId)
  const currentChainName = currentChain?.label.toLowerCase()

  const [isLoadingBondedTokens, setLoadingBondedTokens] = useState<boolean>(true)
  const [isLoadingLiquidTokens, setLoadingLiquidTokens] = useState<boolean>(true)
  const [isLoadingTokensToUnbond, setLoadingTokensToUnbond] = useState<boolean>(true)
  const [isLoadingWithdrawableTokens, setLoadingWithdrawableTokens] = useState<boolean>(true)

  const data: BondingData[] = [
    {
      tokenType: TokenType.liquid,
      value: null,
      color: "#244228",
      label: "Liquid",
      actionType: ActionType.buy
    },
    {
      tokenType: TokenType.bonded,
      value: null,
      color: "#7CFB7D",
      label: "Bonded",
      actionType: ActionType.bond
    },
    {
      tokenType: TokenType.unbonding,
      value: null,
      color: "#3273F6",
      label: "Unbonding",
      actionType: ActionType.unbond
    },
    {
      tokenType: TokenType.withdrawable,
      value: null,
      color: "#173E84",
      label: "Withdrawable",
      actionType: ActionType.withdraw
    },
  ];

  const [updatedData, setData] = useState(null)

  const setValue = (tokenType: TokenType, value: number) => {
    data.find(e => e.tokenType == tokenType).value = value
  }

  const setBondedTokens = async function (ampWhale, bWhale) {
    setLoadingBondedTokens(false);
    setValue(TokenType.bonded, (ampWhale + bWhale))
  }
  const setLiquidTokens = async function (whale, ampWhale, bWhale) {

    setLoadingLiquidTokens(false);
    setValue(TokenType.liquid, (whale + ampWhale + bWhale))
  }

  const setUnbondingTokens = async function (ampWhale, bWhale) {
    setLoadingTokensToUnbond(false);
    setValue(TokenType.unbonding, (ampWhale + bWhale))
  }

  const setWithdrawableTokens = async function (ampWhale, bWhale) {
    setLoadingWithdrawableTokens(false);
    setValue(TokenType.withdrawable, (ampWhale + bWhale))
  }
  const {data: poolList} = usePoolsListQuery()
  const whaleTokenList = useMemo(() => {
    let listObj = {}
    const {pools = []} = poolList || {}
    pools
      .map(({pool_assets}) => pool_assets)
      .map(([a, b]) => {
        listObj = {...listObj, [a.symbol]: a, [b.symbol]: b}
      })

    return Object.keys(listObj).map((row) => {
      return {
        symbol: listObj[row].symbol,
        decimals: listObj[row].decimals,
        amount: 0,
      }
    }).filter(token => ["ampWHALE", "bWHALE", "WHALE"].includes(token.symbol))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolList, chainId])

  const {balance: liquidWhale} = useTokenBalance(
    "WHALE")
  const {balance: liquidAmpWhale} = useTokenBalance(
    "ampWHALE")
  const {balance: liquidBWhale} = useTokenBalance(
    "bWHALE")

  const bondedAmpWhale = isWalletConnected ? 2345 : null
  const bondedBWhale = isWalletConnected ? 2345 : null
  const unbondingAmpWhale = isWalletConnected ? 535 : null
  const unbondingBWhale = isWalletConnected ? 5345 : null
  const withdrawableAmpWhale = isWalletConnected ? 9845 : null
  const withdrawableBWhale = isWalletConnected ? 8365 : null


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


  const [isLoadingRewards, setLoadingRewards] = useState<boolean>(true)

  const [price, setPrice] = useState(null);

  const [isLoadingWhalePrice, setLoadingWhalePrice] = useState<boolean>(true)

  const fetchPrice = async function () {
    const value = 12.53// replace with result from get req
    setPrice(value);
    setLoadingWhalePrice(false);
  }

  const [myRewards, setMyRewards] = useState<number>(null);

  const fetchMyRewards = async function () {
    const value = 0// replace with result from get req
    setMyRewards(value);
    setLoadingRewards(false);
  }

  useEffect(() => {
    setTimeout(async () => {
      await setBondedTokens(bondedAmpWhale, bondedBWhale);
      await setLiquidTokens(liquidWhale, liquidAmpWhale, liquidBWhale);
      await setUnbondingTokens(unbondingAmpWhale, unbondingBWhale);
      await setWithdrawableTokens(withdrawableAmpWhale, withdrawableBWhale);
      setData(data)
      await fetchPrice();
      await fetchMyRewards();

      if(currentBondingState.status === BondingStatus.uninitialized ){
        setCurrentBondingState({
          status: BondingStatus.available,
          edgeTokenList: ["ampWHALE", "bWHALE"],
          bondedAmpWhale: bondedAmpWhale,
          bondedBWhale: bondedBWhale,
          unbondingAmpWhale: unbondingAmpWhale,
          unbondingBWhale: unbondingBWhale,
          withdrawableAmpWhale: withdrawableAmpWhale,
          withdrawableBWhale: withdrawableBWhale,
        })
      }
    }, 2000)

  }, [isWalletConnected]);

  const isLoading = isLoadingRewards || isLoadingWhalePrice || isLoadingBondedTokens || isLoadingLiquidTokens || isLoadingTokensToUnbond || isLoadingWithdrawableTokens

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
          paddingY={5}
        >
          <Text
            as="h2"
            fontSize="24"
            fontWeight="900">
            Bonding
          </Text>
        </HStack>
        <BondingOverview
          isWalletConnected={isWalletConnected}
          isLoading={isLoading}
          data={updatedData}
          liquidWhale={liquidWhale}
          liquidAmpWhale={liquidAmpWhale}
          liquidBWhale={liquidBWhale}
          bondedAmpWhale={bondedAmpWhale}
          bondedBWhale={bondedBWhale}
          unbondingAmpWhale={unbondingAmpWhale}
          unbondingBWhale={unbondingBWhale}
          withdrawableAmpWhale={withdrawableAmpWhale}
          withdrawableBWhale={withdrawableBWhale}
          currentChainName={currentChainName}/>
      </VStack>
      <RewardsComponent isWalletConnected={isWalletConnected} isLoading={isLoading}
                        isHorizontalLayout={isHorizontalLayout} myRewards={myRewards} whalePrice={price}/>
    </Flex>
  </VStack>
}
export default Bonding
