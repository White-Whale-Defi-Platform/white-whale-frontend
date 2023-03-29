import React, {useMemo} from 'react'

import {Box, Button, HStack, Image, keyframes, Text, useDisclosure, VStack} from '@chakra-ui/react'

import {walletState} from '../../../state/atoms/walletAtoms'

import {useRecoilState} from 'recoil'
import WalletModal from '../../Wallet/Modal/Modal'
import Loader from '../../Loader'
import {useFeeDistributorConfig} from "./hooks/useFeeDistributorConfig";
import {useCurrentEpoch} from "./hooks/useCurrentEpoch";
import {useClaimableEpochs} from "./hooks/useClaimableEpochs";
import {useQuery} from "react-query";
import {useChains} from "../../../hooks/useChainInfo";
import {convertMicroDenomToDenom} from "../../../util/conversion";
import {useWeight} from "./hooks/useWeight";
import {ActionType} from "./BondingOverview";
import {useBonded} from "./hooks/useBonded";
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
const RewardsComponent = ({isWalletConnected, isLoading, isHorizontalLayout, whalePrice}) => {
  const [{chainId, client, address}, _] = useRecoilState(walletState)
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure()

  // const tokenADollarPrice = await getTokenDollarValue({
  //   tokenA,
  //   tokenAmountInDenom: 1,
  //   tokenB
  // })

  const {bondingConfig} = useFeeDistributorConfig(client);

  const epochDurationInSeconds = bondingConfig?.epoch_config.duration;

  const {currentEpoch, isLoading: currentEpochLoading} = useCurrentEpoch(client);
  const startTimeInNanoSeconds = Number(currentEpoch?.epoch?.start_time ?? 0)
  const availableAmount = convertMicroDenomToDenom(Number(currentEpoch?.epoch?.available?.[0].amount), 6)
  const date = new Date(Math.floor(startTimeInNanoSeconds / 1000000));
  const startHour = date.getUTCHours();

  const totalRewards = convertMicroDenomToDenom(Number(currentEpoch?.epoch?.total?.[0].amount), 6)

  const {claimableEpochs, isLoading: loading} = useClaimableEpochs(client);

  const {weightInfo} = useWeight(client, address)

  const {totalBonded} = useBonded(client, address)

  const globalWeight = convertMicroDenomToDenom(Number(weightInfo?.global_weight), 6)
  const localWeight = convertMicroDenomToDenom(Number(weightInfo?.weight), 6)

  const myShare = Number(weightInfo?.share)

  const {txStep,submit} = useTransaction({})
  const calculateDurationString = (durationInSec: number): string => {
    if (durationInSec >= 86400) {
      return `${Math.floor(durationInSec / 86400)} days`;
    } else if (durationInSec >= 3600) {
      return `${Math.floor(durationInSec / 3600)} hours`;
    } else if (durationInSec >= 60) {
      return `${Math.floor(durationInSec / 60)} minutes`;
    } else if (durationInSec > 0) {
      return `${Math.floor(durationInSec)} seconds`;
    } else {
      return `imminent`;
    }
  };
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

  if (referenceDate.getHours() < startHour) {
    currentEpochStartDate = new Date();
    currentEpochStartDate.setUTCDate(referenceDate.getUTCDate() - 1)
    currentEpochStartDate.setUTCHours(startHour, 0, 0, 0);
  } else {
    currentEpochStartDate = new Date();
    currentEpochStartDate.setUTCDate(referenceDate.getUTCDate())
    currentEpochStartDate.setUTCHours(startHour, 0, 0, 0);
  }

  const durationInSeconds = (Date.now() - currentEpochStartDate.getTime()) / 1_000

  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) return 'Connect Wallet'
    else if (totalRewards === 0) return 'No rewards to claim'
    else return 'Claim'
  }, [isWalletConnected, totalRewards])

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
            {calculateDurationString(86400 - durationInSeconds)}
          </Text>
        </HStack>
        <ProgressBar percent={(durationInSeconds / epochDurationInSeconds) * 100}/>
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
            {isWalletConnected ? `${(totalRewards).toLocaleString()} WHALE ` : "n/a"}
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
              `${((totalRewards / totalBonded) * 100).toFixed(2)}%`:
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
              `${((localWeight/ totalBonded) * 100).toFixed(2)}%` :
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
          (isWalletConnected && totalRewards === 0)}
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
