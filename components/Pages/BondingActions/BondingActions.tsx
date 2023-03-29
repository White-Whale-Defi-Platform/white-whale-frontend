import {ArrowBackIcon} from "@chakra-ui/icons"
import {Box, Button, HStack, IconButton, Text, useDisclosure, VStack} from "@chakra-ui/react"
import {useRecoilState} from "recoil"
import {useChains} from "../../../hooks/useChainInfo"
import {walletState, WalletStatusType} from "../../../state/atoms/walletAtoms"
import {ActionType} from "../Bonding/BondingOverview"
import Bond, {LSDTokenItemState} from "./Bond"
import Unbond from "./Unbond"
import Withdraw from "./Withdraw"
import {useRouter} from 'next/router'

import {bondingAtom} from "./bondAtoms";
import React, {useEffect, useMemo, useState} from "react";
import WalletModal from "../../Wallet/Modal/Modal";
import useTransaction, {TxStep} from "./hooks/useTransaction";
import {
  AMP_WHALE_TOKEN_SYMBOL,
  B_WHALE_TOKEN_SYMBOL,
  BONDING_TOKEN_SYMBOL_DENOM_MAP
} from "../../../constants/bonding_contract";
import {useBonded} from "../Bonding/hooks/useBonded";
import Loader from "../../Loader";
import {useTokenBalance} from "../../../hooks/useTokenBalance";
import {useWithdrawable} from "../Bonding/hooks/useWithdrawable";
import {useUnbonding} from "../Bonding/hooks/useUnbonding";
import {useBondingConfig} from "../Bonding/hooks/useBondingConfig";
import {useWhalePrice} from "../../../queries/useGetTokenDollarValueQuery";

export enum WhaleTokenType {
  ampWHALE, bWHALE
}

const BondingActions = ({globalAction}) => {

  const [{chainId,client, address, status },_] = useRecoilState(walletState)
  const isWalletConnected: boolean = status === WalletStatusType.connected
  const chains: Array<any> = useChains()
  const currentChain = chains.find((row: { chainId: string }) => row.chainId === chainId)
  const currentChainName = currentChain?.label.toLowerCase()
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure()

  const router = useRouter()
  const {txStep,submit} = useTransaction({})


  const [currentBondState, setCurrentBondState] = useRecoilState<LSDTokenItemState>(bondingAtom)
  const {balance: liquidAmpWhale, isLoading: ampWhaleLoading} = useTokenBalance(
    AMP_WHALE_TOKEN_SYMBOL)
  const {balance: liquidBWhale, isLoading: bWhaleLoading} = useTokenBalance(
    B_WHALE_TOKEN_SYMBOL)
  const { bondedAmpWhale, bondedBWhale, isLoading: bondedAssetsLoading } = useBonded(client, address)

  const whalePrice = useWhalePrice()

  const {
    unbondingAmpWhale,
    unbondingBWhale,
    filteredUnbondingRequests,
    isLoading: isUnbondingLoading,
    refetch: refetchUnbonding
  } = useUnbonding(client, address)

  const {
    withdrawableAmpWhale,
    withdrawableBWhale,
    isLoading: isWithdrawLoading,
    refetch: refetchWithdrawable
  } = useWithdrawable(client, address)

  const {bondingConfig,isLoading: isBondingConfigLoading, refetch: refetchConfig} = useBondingConfig(client)

  const unbondingPeriodInNano = Number(bondingConfig?.unbonding_period) * 1_000_000_000 ?? 60 * 1_000_000_000

  useEffect(() => {
    refetchConfig()
    refetchUnbonding()
    refetchWithdrawable()

  }, [address, client])

  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) return 'Connect Wallet'
    else if (currentBondState?.amount === 0 && globalAction !== ActionType.withdraw) return 'Enter Amount'
    else return ActionType[globalAction]
  }, [isWalletConnected, currentBondState, globalAction])


  const [isLoading , setIsLoading]= useState<boolean>(true)

  useEffect(()=>{
    setIsLoading(bondedAssetsLoading || ampWhaleLoading || bWhaleLoading || isWithdrawLoading || isUnbondingLoading || isBondingConfigLoading)
  }, [bondedAssetsLoading, ampWhaleLoading, bWhaleLoading, isWithdrawLoading, isUnbondingLoading, isBondingConfigLoading])

  const BondingActionButton = ({action}) => {

    const actionString = ActionType[action].toString()
    const onClick = async () => {
      setCurrentBondState({...currentBondState, amount:0})
      await router.push(`/${currentChainName}/bonding/${actionString}`)
    }

    return <Button
      sx={{
        "&:hover": {
          backgroundColor: "#1C1C1C",
          color: "#6ACA70",
        },
      }}
      color={globalAction === action ? "white" : "grey"}
      bg={"#1C1C1C"}
      fontSize={20}
      px={5}
      transform="translate(0%, -55%)"
      style={{textTransform: "capitalize"}}
      onClick={onClick}>
      {actionString}
    </Button>
  }

  return (
    <VStack
      width={{base: '100%', md: '650px'}}
      alignItems="flex-start"
      top={200}
      gap={4}
      position="absolute">
      <HStack
        justifyContent="space-between"
        width="full"
        paddingY={5}>
        <IconButton
          variant="unstyled"
          color="white"
          fontSize="28px"
          aria-label="go back"
          icon={<ArrowBackIcon/>}
          onClick={async () => {
           await router.push(`/${currentChainName}/bonding`)
            setCurrentBondState({...currentBondState, amount:0})
          }}
        />
        <Text
          as="h2"
          fontSize="24"
          fontWeight="900"
          style={{textTransform: "capitalize"}}>
          {ActionType[globalAction]}
        </Text>
      </HStack>
      ({isLoading ?
      <VStack
        width="full"
        background={"#1C1C1C"}
        borderRadius={"30px"}
        justifyContent="center"
        top={70}
        minH={280}
        gap={4}
        as="form"
        position="absolute"
        pb={7}
        left="50%"
        transform="translateX(-50%)"
        display="flex">
        <HStack
          minW={100}
          minH={100}
          width="full"
          alignContent="center"
          justifyContent="center"
          alignItems="center">
          <Loader/>
        </HStack>
      </VStack>:
      <VStack
        width="full"
        background={"#1C1C1C"}
        borderRadius={"30px"}
        alignItems="flex-start"
        verticalAlign="flex-start"
        top={70}
        maxH={660}
        gap={4}
        as="form"
        position="absolute"
        pb={7}
        left="50%"
        transform="translateX(-50%)"
        display="flex">
        <Box
          border="0.5px solid grey"
          borderRadius="30px"
          minH={160}
          minW={570}
          alignSelf="center"
          mt={"50px"}>
          <HStack
            spacing={0}
            justify="center">
            <BondingActionButton action={ActionType.bond}/>
            <BondingActionButton action={ActionType.unbond}/>
            <BondingActionButton action={ActionType.withdraw}/>
          </HStack>
          {(() => {
            switch (globalAction) {
              case ActionType.bond:
                return <Bond
                  liquidAmpWhale={liquidAmpWhale}
                  liquidBWhale={liquidBWhale}
                  whalePrice={whalePrice}
                />;
              case ActionType.unbond:
                return <Unbond
                  bondedAmpWhale={bondedAmpWhale}
                  bondedBWhale={bondedBWhale}
                  whalePrice={whalePrice}

                />;
              case ActionType.withdraw:
                return <Withdraw withdrawableAmpWhale={withdrawableAmpWhale}
                                 withdrawableBWhale={withdrawableBWhale}
                                 unbondingAmpWhale={unbondingAmpWhale}
                                 unbondingBWhale={unbondingBWhale}
                                 filteredUnbondingRequests={filteredUnbondingRequests}
                                 unbondingPeriodInNano={unbondingPeriodInNano}
                />;
            }
          })()}
        </Box>
        <Button
          alignSelf="center"
          bg="#6ACA70"
          borderRadius="full"
          width="100%"
          variant="primary"
          disabled={txStep == TxStep.Estimating ||
            txStep == TxStep.Posting ||
            txStep == TxStep.Broadcasting ||
            (currentBondState.amount <= 0 && globalAction !== ActionType.withdraw) && isWalletConnected}
          maxWidth={570}
          isLoading={
            txStep == TxStep.Estimating ||
            txStep == TxStep.Posting ||
            txStep == TxStep.Broadcasting
          }
          onClick={async () => {
            if(isWalletConnected){
               await submit(globalAction,currentBondState.amount,BONDING_TOKEN_SYMBOL_DENOM_MAP[currentBondState.tokenSymbol])}
            else{
              onOpenModal()
            }
          }}
          style={{textTransform: "capitalize"}}>
          {buttonLabel}
        </Button>
        <WalletModal
          isOpenModal={isOpenModal}
          onCloseModal={onCloseModal}
          chainId={chainId}
        />
      </VStack>})
    </VStack>)
}

export default BondingActions
