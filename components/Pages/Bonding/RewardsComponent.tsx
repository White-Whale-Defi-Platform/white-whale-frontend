import { useEffect, useMemo, useState } from 'react'

import {
  Box,
  Button,
  HStack,
  Image,
  Text,
  Tooltip,
  VStack,
  keyframes,
} from '@chakra-ui/react'
import { useChain } from '@quirks/react'
import { BondingActionTooltip } from 'components/Pages/Bonding/BondingActions/BondingActionTooltip'
import useTransaction from 'components/Pages/Bonding/BondingActions/hooks/useTransaction'
import {
  Config,
  useConfig,
} from 'components/Pages/Bonding/hooks/useDashboardData'
import { RewardsTooltip } from 'components/Pages/Bonding/RewardsTooltip'
import useForceEpochAndTakingSnapshots from 'components/Pages/Trade/Liquidity/hooks/useForceEpochAndTakingSnapshots'
import { kBorderRadius, kBg } from 'constants/visualComponentConstants'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { TxStep } from 'types/index'
import { nanoToMilli, useCalculateRewardDurationString } from 'util/conversion/timeUtil'

import { ActionType } from './BondingOverview'

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
`

const ProgressBar = ({ progress, currentEpochStartTimeInNano }) => {
  const colors = ['#E43A1C', '#EE902E', '#FAFD3C', '#7CFB7D']
  const [isImminent, setImminent] = useState<boolean>(false)
  const [percent, setPercent] = useState<number>(0)

  const currentDate: Date = new Date()
  currentDate.setDate(currentDate.getDate() - 1)
  const currentDateTimeMinusOneDay = currentDate.getTime()
  const epochStartDateTime = new Date(nanoToMilli(currentEpochStartTimeInNano)).getTime()

  useEffect(() => {
    if (!isImminent) {
      if (progress === 100) {
        setImminent(true)
      }
      setPercent(progress)
    }
    if (
      (isImminent && currentDateTimeMinusOneDay < epochStartDateTime) ||
      currentEpochStartTimeInNano === 0
    ) {
      setImminent(false)
    }
  }, [progress, currentDateTimeMinusOneDay])

  return (
    <Box
      h="7px"
      width={[280, 340]}
      maxWidth={360}
      bg={
        percent === 100 && currentEpochStartTimeInNano > 0
          ? 'transparent'
          : 'whiteAlpha.400'
      }
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
          isImminent ? `${pulseAnimation} 1.8s ease-in-out infinite` : null
        }
      />
    </Box>
  )
}

const RewardsComponent = ({
  isWalletConnected,
  whalePrice,
  currentEpoch,
  myTotalBonding,
  feeDistributionConfig,
  annualRewards,
  globalAvailableRewards,
  totalGlobalClaimable,
  daysSinceLastClaim,
  weightInfo,
  globalInfo,
}) => {
  const { network, chainId, walletChainName } = useRecoilValue(chainState)

  const { openView } = useChain(walletChainName)

  const claimableRewards = useMemo(() => totalGlobalClaimable * Number(weightInfo?.share || 0),
    [totalGlobalClaimable, weightInfo])

  const epochDurationInMilli = nanoToMilli(Number(feeDistributionConfig?.epoch_config?.duration))

  const genesisStartTimeInNano = Number(feeDistributionConfig?.epoch_config?.genesis_epoch ?? 0)

  const myWeight = Number(weightInfo?.weight)

  const multiplierRatio = Math.max((myWeight || 0) / (myTotalBonding || 1),
    1)
  const myYearlyEmission = annualRewards * (myWeight / (globalInfo?.weight || 0))
  const myApr = (myYearlyEmission / myTotalBonding) * 1_000_000 * 100

  const defaultApr = (annualRewards * (1_000_000 / (globalInfo?.weight || 0))) * 100
  const apr = useMemo(() => (myApr ? myApr : defaultApr),
    [myApr, defaultApr])

  const { txStep, submit } = useTransaction()

  const config: Config = useConfig(network, chainId)

  const forceEpochAndTakeSnapshots = useForceEpochAndTakingSnapshots({
    noSnapshotTakenAddresses: null,
    config,
  })
  const currentEpochStartDateTimeInMilli = new Date(nanoToMilli(Number(currentEpoch?.epoch?.start_time))).getTime()

  const passedTimeSinceCurrentEpochStartedInMilli =
    Date.now() - currentEpochStartDateTimeInMilli

  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) {
      return 'Connect Wallet'
    } else if (claimableRewards === 0 && totalGlobalClaimable === 0) {
      return 'No Rewards'
    }
    return 'Claim'
  }, [isWalletConnected, globalAvailableRewards, claimableRewards])

  const durationString = useCalculateRewardDurationString(epochDurationInMilli - passedTimeSinceCurrentEpochStartedInMilli,
    genesisStartTimeInNano)

  const progress = Math.min((passedTimeSinceCurrentEpochStartedInMilli / epochDurationInMilli) * 100,
    100)

  const bondingHasStarted: boolean = useMemo(() => genesisStartTimeInNano / 1_000_000 < Date.now(),
    [genesisStartTimeInNano])
  return (
    <VStack
      px={8}
      background={kBg}
      boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.4)'}
      borderRadius={kBorderRadius}
      alignItems="center"
      minH={317}
      width="flex"
      gap={4}
      overflow="hidden"
      position="relative"
      display="flex"
      justifyContent="flex-start"
    >
      <HStack spacing={['100', '150']} align="stretch" mt={5}>
        <HStack flex="1">
          <a>
            <Image
              src="/logos/logo.svg"
              alt="WhiteWhale Logo"
              boxSize={[5, 7]}
            />
          </a>
          <Text fontSize={20}>WHALE</Text>
        </HStack>
        <Text color="#7CFB7D" fontSize={18}>
              ${whalePrice?.toFixed(6)}
        </Text>
      </HStack>
      <HStack justify={'space-between'} width={340}>
        <VStack border="0.5px solid"
          borderColor="whiteAlpha.400"
          borderRadius="10px"
          px={4}
          pt={1}
          alignItems={'start'}
          h={68}
          w={163}>
          <Text color="whiteAlpha.600">
            APR
          </Text>
          <Text fontWeight={'bold'}>{`${apr.toFixed(2)}%`}</Text>
        </VStack>
        <VStack border="0.5px solid"
          borderColor="whiteAlpha.400"
          borderRadius="10px"
          px={4}
          pt={1}
          alignItems={'start'} h={68} w={163}
          justifyContent="space-between">
          <HStack>
            <Text color="whiteAlpha.600">Rewards</Text>
            <BondingActionTooltip action={ActionType.claim} />
          </HStack>
          <RewardsTooltip
            dollarValue={
              isWalletConnected
                ? `$${(claimableRewards * whalePrice).toFixed(2)}`
                : 'n/a'
            }
            isWalletConnected={isWalletConnected}
            amount={claimableRewards.toFixed(6)}
            daysSinceLastClaim={daysSinceLastClaim}
          />
        </VStack>

      </HStack>

      <HStack
        border="0.5px solid"
        borderColor="whiteAlpha.400"
        borderRadius="10px"
        py={3}
        px={4}
        minWidth={340}
        spacing={['100', '215']} align="stretch"
        justifyContent="space-between">
        <Text color="whiteAlpha.600" fontSize={13}>
            Multiplier
        </Text>
        <Text fontSize={13}>
          {isWalletConnected
            ? `${((multiplierRatio - 1) * 100).toFixed(2)}%`
            : 'n/a'}
        </Text>
      </HStack>
      <VStack mt={-1}>
        <HStack justifyContent="space-between" minWidth={['280', '340']}>
          <Text color="whiteAlpha.600" fontSize={14}>Next rewards in</Text>
          <Text fontSize={14}>{durationString}</Text>
        </HStack>
        <ProgressBar
          progress={progress}
          currentEpochStartTimeInNano={Number(currentEpoch?.epoch?.start_time)}
        />
      </VStack>
      <HStack w={[290, 345]}>
        <Button
          alignSelf="center"
          bg="#6ACA70"
          mt={0.5}
          borderRadius="full"
          variant="primary"
          width={'100%'}
          isDisabled={
            txStep === TxStep.Estimating ||
                txStep === TxStep.Posting ||
                txStep === TxStep.Broadcasting ||
                (isWalletConnected && claimableRewards === 0 && totalGlobalClaimable === 0)
          }
          maxWidth={570}
          isLoading={
            txStep === TxStep.Estimating ||
                txStep === TxStep.Posting ||
                txStep === TxStep.Broadcasting
          }
          onClick={ () => {
            if (isWalletConnected) {
              submit(
                ActionType.claim, null, null,
              )
            } else {
              openView()
            }
          }}
          style={{ textTransform: 'capitalize' }}
        >
          {buttonLabel}
        </Button>
        {progress === 100 && isWalletConnected && bondingHasStarted && (
          <Tooltip
            label="Community driven enforcement of the next epoch."
            borderRadius={10}
            bg="black"
          >
            <Button
              alignSelf="center"
              bg="transparent"
              borderRadius="full"
              border="1px solid white"
              width="50%"
              variant="primary"
              _hover={{
                border: '1px solid #6ACA70',
                color: '#6ACA70',
              }}
              onClick={() => forceEpochAndTakeSnapshots.submit()}
            >
              {'Force Epoch'}
            </Button>
          </Tooltip>
        )}
      </HStack>
    </VStack>)
}

export default RewardsComponent
