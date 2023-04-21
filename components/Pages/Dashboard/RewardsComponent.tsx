import React, {useEffect, useMemo, useState} from 'react'

import {Box, Button, HStack, Image, keyframes, Text, useDisclosure, VStack} from '@chakra-ui/react'

import {walletState} from 'state/atoms/walletAtoms'

import {useRecoilState} from 'recoil'
import WalletModal from '../../Wallet/Modal/Modal'
import Loader from '../../Loader'
import {useQuery} from "react-query";
import {useChains} from "hooks/useChainInfo";
import {
  calculateRewardDurationString,
  convertDenomToMicroDenom,
  convertMicroDenomToDenom,
  nanoToMilli
} from "util/conversion";
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

const ProgressBar = ({progress, statusBlock}) => {
  const colors = ["#E43A1C", "#EE902E", "#FAFD3C", "#7CFB7D"]
  const [block, setBlock] = useState<number>(null)
  const [isImminent, setImminent] = useState<boolean>(false)
  const [percent, setPercent] = useState<number>(0)

// progress equals percent, just different naming necessary
  useEffect(() => {
    if (block !== null && Number(statusBlock) > block && isImminent) {
      setImminent(false)
    }
    setBlock(Number(statusBlock))
  }, [statusBlock])

  useEffect(() => {
    if (!isImminent) {
      if (progress === 100) {
        setImminent(true)
      }
      setPercent(progress)
    }
  }, [progress])

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
          isImminent
            ? `${pulseAnimation} 1.8s ease-in-out infinite`
            : undefined
        }
      />
    </Box>
  )
}

const RewardsComponent = ({
                            isWalletConnected,
                            isLoading,
                            whalePrice,
                            localTotalBonded,
                            globalTotalBonded,
                            feeDistributionConfig,
                            currentEpoch,
                            annualRewards,
                            globalAvailableRewards,
                            claimableRewards,
                            weightInfo
                          }) => {

  const [{chainId}, _] = useRecoilState(walletState)
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure()

  const epochDurationInMilli = nanoToMilli(Number(feeDistributionConfig?.epoch_config?.duration))

  const epochStartTimeInNano = Number(currentEpoch?.epoch?.start_time ?? 0)

  const epochStartDate = new Date(Math.floor((nanoToMilli(epochStartTimeInNano))))
  const epochStartHour = epochStartDate.getUTCHours();
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

  const localWeight = convertMicroDenomToDenom(Number(weightInfo?.weight), 6)
  const localBonded = convertDenomToMicroDenom(localTotalBonded, 6)

  const multiplierRatio = Math.max((localWeight || 0) / (localBonded || 1), 1)

  const apr = ((annualRewards || 0) / (globalTotalBonded || 1)) * 100 * multiplierRatio

  const {txStep, submit} = useTransaction()

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
  const durationInMilli = (Date.now() - currentEpochStartDate.getTime())

  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) return 'Connect Wallet'
    else if (claimableRewards === 0) return 'No Rewards'
    else return 'Claim'
  }, [isWalletConnected, globalAvailableRewards])

  const durationString = calculateRewardDurationString(epochDurationInMilli - durationInMilli, Number(status?.block))

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
      justifyContent="center">
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
      justifyContent="flex-start">
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
            {isWalletConnected ? durationString : ""}
          </Text>
        </HStack>
        <ProgressBar progress={(durationInMilli / epochDurationInMilli) * 100} statusBlock={(status?.block)}/>
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
            {isWalletConnected ? `$${(claimableRewards * whalePrice).toFixed(2)}` : "n/a"}
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
              `${(apr).toFixed(2)}%` :
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
              `${((multiplierRatio - 1) * 100).toFixed(2)}%` :
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
        onClick={async () => {
          if (isWalletConnected) {
            await submit(ActionType.claim, null, null)
          } else {
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
