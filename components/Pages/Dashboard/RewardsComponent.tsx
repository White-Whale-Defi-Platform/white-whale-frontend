import React, {useMemo} from 'react'

import {Box, Button, HStack, Image, keyframes, Text, useDisclosure, VStack} from '@chakra-ui/react'

import {walletState} from '../../../state/atoms/walletAtoms'

import {useRecoilState} from 'recoil'
import WalletModal from '../../Wallet/Modal/Modal'
import Loader from '../../Loader'
import {useQuery} from "react-query";
import {useChains} from "../../../hooks/useChainInfo";
import {calculateDurationString, convertMicroDenomToDenom} from "../../../util/conversion";
import {ActionType} from "./BondingOverview";
import useTransaction, {TxStep} from "../BondingActions/hooks/useTransaction";

const pulseAnimation = keyframes`
  0% {
    transform: scale(0.99) translateX(0%);
    background-color: #FAFD3C;
  }
  25% {
    transform: scale(1) translateX(0%);
    background-color: #7CFB7D;
  }
  50% {
    transform: scale(0.99) translateX(0%);
    background-color: #FAFD3C;
  }
  75% {
    transform: scale(1) translateX(0%);
    background-color: #7CFB7D;
  }
  100% {
    transform: scale(0.99) translateX(0%);
    background-color: #FAFD3C;
  }
`;

const ProgressBar = ({percent}) => {
  const colors = ["#E43A1C", "#EE902E", "#FAFD3C", "#7CFB7D"]
  return (
    <Box
      h="7px"
      minW={390}
      bg={percent === 100 ? "transparent" : "whiteAlpha.400"}
      borderRadius="10px"
      overflow="hidden"
      position="relative"
    >
      <Box
        h="100%"
        bg={colors[Math.trunc(percent / 25)]}
        w={`${percent}%`}
        borderRadius="10px"
        position="relative"
        animation={
          percent === 100
            ? `${pulseAnimation} 1.8s ease-in-out infinite`
            : undefined
        }
      />
    </Box>
  );
};
const RewardsComponent = ({isWalletConnected, isLoading, isHorizontalLayout, whalePrice, localTotalBonded, globalTotalBonded, feeDistributionConfig, currentEpoch,annualRewards,globalAvailableRewards,claimableRewards, weightInfo}) => {
  const [{chainId}, _] = useRecoilState(walletState)
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure()

  const epochDurationInMillis = Number(feeDistributionConfig?.epoch_config?.duration) / 1_000_000;

  const epochStartTimeInNanoSeconds = Number(currentEpoch?.epoch?.start_time ?? 0)

  const date = new Date(Math.floor(epochStartTimeInNanoSeconds / 1_000_000));
  const epochStartHour = date.getUTCHours();

  const localWeight = convertMicroDenomToDenom(Number(weightInfo?.weight), 6)

  const {txStep,submit} = useTransaction({})

  const chains: Array<any> = useChains()

  const url = useMemo(() => {
    return chains?.find((c) => c?.chainId === chainId)?.rpc
  }, [chainId, chains])

  const {data: status} = useQuery(
    ['status', chainId],
    async () => {
      const res = await fetch(`${url}/status?`)
      const resJons = await res?.json()
      return {
        block: resJons?.result?.sync_info?.latest_block_height || status?.block,
        active: !!resJons?.result?.sync_info?.latest_block_height,
      }
    },
    {
      refetchInterval: 6000,
      enabled: !!url,
    }
  )
  // TODO global constant?
  const boxBg = "#1C1C1C"
  // TODO global constant ?
  const borderRadius = "30px"
  const referenceDate = new Date()
  let currentEpochStartDate: Date

  if (referenceDate.getUTCHours() < epochStartHour) {
    currentEpochStartDate = new Date();
    currentEpochStartDate.setUTCDate(referenceDate.getUTCDate() - 1)
    currentEpochStartDate.setUTCHours(epochStartHour, 0, 0, 0);
  } else {
    currentEpochStartDate = new Date();
    currentEpochStartDate.setUTCDate(referenceDate.getUTCDate())
    currentEpochStartDate.setUTCHours(epochStartHour, 0, 0, 0);
  }
  const durationInMillis = (Date.now() - currentEpochStartDate.getTime())

  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) return 'Connect Wallet'
    else if (claimableRewards === 0) return 'No Rewards'
    else return 'Claim'
  }, [isWalletConnected, globalAvailableRewards])

  return (<>{isLoading ?
    <VStack
      width="full"
      background={boxBg}
      borderRadius={borderRadius}
      minH={320}
      w={450}
      gap={4}
      overflow="hidden"
      position="relative"
      display="flex"
      justifyContent="center"
      alignSelf={isHorizontalLayout ?
        "none" : "center"}>
      <HStack
        minW={100}
        minH={100}
        width="full"
        alignContent="center"
        justifyContent="center"
        alignItems="center">
        <Loader/>
      </HStack>
    </VStack> :
    <VStack
      width="full"
      background={boxBg}
      borderRadius={borderRadius}
      alignItems="center"
      minH={320}
      w={450}
      gap={4}
      overflow="hidden"
      position="relative"
      display="flex"
      justifyContent="flex-start"
      alignSelf={isHorizontalLayout ? "none" : "center"}>
      <HStack
        justifyContent="space-between"
        align="stretch"
        mt={7}
        minW={390}>
        <HStack flex="1">
          <a>
            <Image
              src="/img/logo.svg"
              alt="WhiteWhale Logo"
              boxSize={[5, 7]}/>
          </a>
          <Text fontSize={20}>WHALE</Text>
        </HStack>
        <Text
          color="#7CFB7D"
          fontSize={18}>
          ${whalePrice.toFixed(6)}
        </Text>
      </HStack>
      <VStack>
        <HStack
          justifyContent="space-between"
          minW={390}>
          <Text
            color="whiteAlpha.600">
            Next rewards in
          </Text>
          <Text>
            {calculateDurationString(epochDurationInMillis - durationInMillis)}
          </Text>
        </HStack>
        <ProgressBar percent={(durationInMillis / epochDurationInMillis) * 100}/>
      </VStack>
      <Box
        border="0.5px solid"
        borderColor="whiteAlpha.400"
        borderRadius="10px"
        p={4}
        minW={390}>
        <HStack
          justifyContent="space-between">
          <Text
            color="whiteAlpha.600">
            Rewards
          </Text>
          <Text>
            {isWalletConnected ? `${(claimableRewards).toLocaleString()} WHALE ` : "n/a"}
          </Text>
        </HStack>
        <HStack>
          <Text
            color="whiteAlpha.600"
            fontSize={11}>
            Estimated APR
          </Text>
          <Text
            fontSize={11}>
            {isWalletConnected ?
              `${((annualRewards / globalTotalBonded) * 100).toFixed(2)}%`:
              "n/a"}
          </Text>
        </HStack>
        <HStack>
          <Text
            color="whiteAlpha.600"
            fontSize={11}>
            Multiplier
          </Text>
          <Text
            fontSize={11}>
            {isWalletConnected ?
              `${((localWeight/ localTotalBonded) * 100).toFixed(2)}%` :
              "n/a"}
          </Text>
        </HStack>
      </Box>
      <Button
        alignSelf="center"
        bg="#6ACA70"
        borderRadius="full"
        width="100%"
        variant="primary"
        w={390}
        disabled={txStep == TxStep.Estimating ||
          txStep == TxStep.Posting ||
          txStep == TxStep.Broadcasting ||
          (isWalletConnected && claimableRewards === 0)}
        maxWidth={570}
        isLoading={
          txStep == TxStep.Estimating ||
          txStep == TxStep.Posting ||
          txStep == TxStep.Broadcasting}
        onClick={async ()=>{
          if(isWalletConnected){
           await submit(ActionType.claim,null,null)}
          else{
            onOpenModal()
          }
        }
      }
        style={{textTransform: "capitalize"}}>
        {buttonLabel}
      </Button>
      <WalletModal
        isOpenModal={isOpenModal}
        onCloseModal={onCloseModal}
        chainId={chainId}/>
    </VStack>
  }</>)
}

export default RewardsComponent
