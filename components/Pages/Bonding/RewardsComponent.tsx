import { useMemo} from 'react'

import {Box, Button, HStack, Image, Text, useDisclosure, VStack, keyframes} from '@chakra-ui/react'

import {walletState, WalletStatusType} from '../../../state/atoms/walletAtoms'

import {useWallet} from '@terra-money/wallet-provider'

import {useRecoilState} from 'recoil'
import WalletModal from '../../Wallet/Modal/Modal'
import Wallet from '../../Wallet/Wallet'
import Loader from '../../Loader'
import {useFeeDistributorConfig} from "./hooks/useFeeDistributorConfig";
import {useCurrentEpoch} from "./hooks/useCurrentEpoch";
import {useClaimRewards} from "./hooks/useClaimRewards";
import {useClaimableEpochs} from "./hooks/useClaimableEpochs";
import {useQuery} from "react-query";
import {useChains} from "../../../hooks/useChainInfo";
import {convertMicroDenomToDenom} from "../../../util/conversion";
import {useTokenDollarValue} from "../../../hooks/useTokenDollarValue";
import {useWeight} from "./hooks/useWeight";

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
const RewardsComponent = ({isWalletConnected, isLoading, isHorizontalLayout}) => {
  const {disconnect} = useWallet()
  const [{key, chainId, network, client, address}, setWalletState] = useRecoilState(walletState)
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure()
  const [tokenPrice] = useTokenDollarValue("WHALE")

  const {bondingConfig} = useFeeDistributorConfig(client);

  const epochDurationInSeconds = bondingConfig?.epoch_config.duration;

  const {currentEpoch, isLoading: is} = useCurrentEpoch(client);
  const startTimeInNanoSeconds = Number(currentEpoch?.epoch?.start_time ?? 0)

  const date = new Date(Math.floor(startTimeInNanoSeconds / 1000000));
  const startHour = date.getUTCHours();

  const totalRewards = convertMicroDenomToDenom(Number(currentEpoch?.epoch?.total?.[0].amount), 6)

  const {claimableEpochs, isLoading: isl} = useClaimableEpochs(client);
  const {weightInfo} = useWeight(client, address)

  const globalWeight = convertMicroDenomToDenom(Number(weightInfo?.global_weight), 6)
  const myShare = Number(weightInfo?.share)
  const claimRewards = useClaimRewards(client, address);
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

  const resetWalletConnection = () => {
    setWalletState({
      status: WalletStatusType.idle,
      address: '',
      key: null,
      client: null,
      network,
      chainId,
      activeWallet: null,
    })
    disconnect()
  }
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
  console.log("currentEpochStartDate")
  console.log(currentEpochStartDate)
  console.log(startHour)
  console.log(Date.now())
  const durationInSeconds = (Date.now() - currentEpochStartDate.getTime()) / 1_000
  console.log(durationInSeconds)

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
      alignSelf={isHorizontalLayout ? "none" : "center"}
    >
      <HStack
        minW={100}
        minH={100}
        width="full"
        alignContent="center"
        justifyContent="center"
        alignItems="center"
      >
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
      alignSelf={isHorizontalLayout ? "none" : "center"}
    >
      <HStack
        justifyContent="space-between"
        align="stretch"
        mt={7}
        minW={390}>
        <HStack flex="1">
          <a>
            <Image src="/img/logo.svg" alt="WhiteWhale Logo" boxSize={[5, 7]}/>
          </a>
          <Text fontSize={20}>WHALE</Text>
        </HStack>
        <Text color="#7CFB7D" fontSize={18}>${tokenPrice}</Text>
      </HStack>
      <VStack
      >
        <HStack
          justifyContent="space-between"
          minW={390}>
          <Text color="whiteAlpha.600">Next rewards in</Text>
          <Text>{calculateDurationString(86400 - durationInSeconds)}</Text>
        </HStack>
        <ProgressBar percent={(durationInSeconds / epochDurationInSeconds) * 100}/>
        {/*'{//<ProgressBar percent={(hours / 24) * 100} />}'*/}
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
            {/*endpoint simulated*/}
            {isWalletConnected ? `${(totalRewards*myShare).toLocaleString()} WHALE ` : "n/a"}
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
            {isWalletConnected ? `${((totalRewards / globalWeight) * 100).toFixed(2)}%`: "n/a"}
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
            {isWalletConnected ? "10 %" : "n/a"}
          </Text>
        </HStack>
      </Box>
      {isWalletConnected ?
        <Button
          bg="#6ACA70"
          borderRadius="full"
          mr="4"
          minW={390}
          disabled={totalRewards === 0}
          color="white"
          onClick={claimRewards}>
          Claim
        </Button> :
        <HStack
          mr="4">
          <Wallet
            connected={Boolean(key?.name)}
            walletName={key?.name}
            onDisconnect={resetWalletConnection}
            disconnect={disconnect}
            isOpenModal={isOpenModal}
            onOpenModal={onOpenModal}
            onCloseModal={onCloseModal}
            isPrimaryButton={true}
            primaryButtonMinW={390}/>
          <WalletModal
            isOpenModal={isOpenModal}
            onCloseModal={onCloseModal}
            chainId={chainId}/>
        </HStack>}
    </VStack>}</>)
}

export default RewardsComponent
