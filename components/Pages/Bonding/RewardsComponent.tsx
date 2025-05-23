import { useEffect, useMemo, useState } from 'react'

import {
  Box,
  Button,
  HStack,
  Image,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useChain } from '@cosmos-kit/react-lite'
import { BondingActionTooltip } from 'components/Pages/Bonding/BondingActions/BondingActionTooltip'
import useTransaction from 'components/Pages/Bonding/BondingActions/hooks/useTransaction'
import {
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

  const { data: config, isLoading: isConfigLoading } = useConfig(network, chainId)
  const forceEpochAndTakeSnapshots = useForceEpochAndTakingSnapshots({
    noSnapshotTakenAddresses: null,
    configState: { config, isLoading: isConfigLoading },
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
  const epochsToForce = Math.floor((Date.now() - (Number(currentEpoch?.epoch?.start_time ?? 0) / 1_000_000)) /
    (1_000 * 3_600 * 24))
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
      justifyContent="space-between"
      py={6}
    >
      <VStack spacing={6} width="full" flex={1}>
        <HStack spacing={['100', '150']} align="stretch">
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
        <VStack flex={1} justify="center">
          <HStack justify={'space-between'} width={340}>
            <VStack border="0.5px solid"
              borderColor="whiteAlpha.400"
              borderRadius="10px"
              px={4}
              pt={1}
              alignItems={'center'} h={68} w={"full"}
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
        </VStack>
      </VStack>

      <HStack w={[290, 345]} mb={4}>
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
              width="55%"
              variant="primary"
              _hover={{
                border: '1px solid #6ACA70',
                color: '#6ACA70',
              }}
              onClick={() => forceEpochAndTakeSnapshots.submit()}
            >
              {`Force Epoch (${epochsToForce})`}
            </Button>
          </Tooltip>
        )}
      </HStack>
    </VStack>
  )
}

export default RewardsComponent
