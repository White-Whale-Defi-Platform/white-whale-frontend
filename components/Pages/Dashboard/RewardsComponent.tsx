import React, { useEffect, useMemo, useState } from 'react'

import {
  Box,
  Button,
  HStack,
  Image,
  Text,
  Tooltip,
  VStack,
  keyframes,
  useDisclosure,
} from '@chakra-ui/react'
import { BondingActionTooltip } from 'components/Pages/BondingActions/BondingAcionTooltip'
import {
  Config,
  useConfig,
} from 'components/Pages/Dashboard/hooks/useDashboardData'
import { RewardsTooltip } from 'components/Pages/Dashboard/RewardsTooltip'
import useForceEpochAndTakingSnapshots from 'components/Pages/Liquidity/hooks/useForceEpochAndTakingSnapshots'
import { useRecoilState } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { calculateRewardDurationString, nanoToMilli } from 'util/conversion'

import Loader from '../../Loader'
import WalletModal from '../../Wallet/Modal/Modal'
import useTransaction, { TxStep } from '../BondingActions/hooks/useTransaction'
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
  const epochStartDateTime = new Date(
    nanoToMilli(currentEpochStartTimeInNano)
  ).getTime()

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
      minW={390}
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
          isImminent ? `${pulseAnimation} 1.8s ease-in-out infinite` : undefined
        }
      />
    </Box>
  )
}

const RewardsComponent = ({
  isWalletConnected,
  isLoading,
  whalePrice,
  currentEpoch,
  localTotalBonded,
  globalTotalBonded,
  feeDistributionConfig,
  annualRewards,
  globalAvailableRewards,
  totalGlobalClaimable,
  daysSinceLastClaim,
  weightInfo,
}) => {
  const [{ chainId, network }, _] = useRecoilState(walletState)
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure()

  const claimableRewards = useMemo(
    () => totalGlobalClaimable * Number(weightInfo?.share || 0),
    [totalGlobalClaimable, weightInfo]
  )

  const epochDurationInMilli = nanoToMilli(
    Number(feeDistributionConfig?.epoch_config?.duration)
  )

  const genesisStartTimeInNano = Number(
    feeDistributionConfig?.epoch_config?.genesis_epoch ?? 0
  )

  const localWeight = Number(weightInfo?.weight)

  const multiplierRatio = Math.max(
    (localWeight || 0) / (localTotalBonded || 1),
    1
  )

  const apr =
    ((annualRewards || 0) / (globalTotalBonded || 1)) * 100 * multiplierRatio

  const { txStep, submit } = useTransaction()

  const config: Config = useConfig(network, chainId)

  const forceEpochAndTakeSnapshots = useForceEpochAndTakingSnapshots({
    noSnapshotTakenAddresses: null,
    config,
  })

  // TODO global constant?
  const boxBg = '#1C1C1C'
  // TODO global constant ?
  const borderRadius = '30px'

  const currentEpochStartDateTimeInMilli = new Date(
    nanoToMilli(Number(currentEpoch?.epoch?.start_time))
  ).getTime()

  const passedTimeSinceCurrentEpochStartedInMilli =
    Date.now() - currentEpochStartDateTimeInMilli

  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) {
      return 'Connect Wallet'
    } else if (claimableRewards === 0) {
      return 'No Rewards'
    }
    return 'Claim'
  }, [isWalletConnected, globalAvailableRewards, claimableRewards])

  const durationString = calculateRewardDurationString(
    epochDurationInMilli - passedTimeSinceCurrentEpochStartedInMilli,
    genesisStartTimeInNano
  )

  const progress = Math.min(
    (passedTimeSinceCurrentEpochStartedInMilli / epochDurationInMilli) * 100,
    100
  )

  const bondingHasStarted: boolean = useMemo(
    () => genesisStartTimeInNano / 1_000_000 < Date.now(),
    [genesisStartTimeInNano]
  )

  return (
    <>
      {isLoading ? (
        <VStack
          width="full"
          background={boxBg}
          borderRadius={borderRadius}
          minH={320}
          w={450}
          gap={3}
          overflow="hidden"
          position="relative"
          display="flex"
          justifyContent="center"
        >
          <HStack
            minW={100}
            minH={100}
            width="full"
            alignContent="center"
            justifyContent="center"
            alignItems="center"
          >
            <Loader />
          </HStack>
        </VStack>
      ) : (
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
        >
          <HStack
            justifyContent="space-between"
            align="stretch"
            mt={7}
            minW={390}
          >
            <HStack flex="1">
              <a>
                <Image
                  src="/img/logo.svg"
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
          <VStack>
            <HStack justifyContent="space-between" minW={390}>
              <Text color="whiteAlpha.600">Next rewards in</Text>
              <Text>{durationString}</Text>
            </HStack>
            <ProgressBar
              progress={progress}
              currentEpochStartTimeInNano={Number(
                currentEpoch?.epoch?.start_time
              )}
            />
          </VStack>
          <Box
            border="0.5px solid"
            borderColor="whiteAlpha.400"
            borderRadius="10px"
            p={4}
            minW={390}
          >
            <HStack justifyContent="space-between">
              <HStack>
                <Text color="whiteAlpha.600">Estimated Rewards</Text>
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
            </HStack>
            <HStack>
              <Text color="whiteAlpha.600" fontSize={11}>
                Estimated APR
              </Text>
              <Text fontSize={11}>
                {isWalletConnected ? `${apr.toFixed(2)}%` : 'n/a'}
              </Text>
            </HStack>
            <HStack>
              <Text color="whiteAlpha.600" fontSize={11}>
                Multiplier
              </Text>
              <Text fontSize={11}>
                {isWalletConnected
                  ? `${((multiplierRatio - 1) * 100).toFixed(2)}%`
                  : 'n/a'}
              </Text>
            </HStack>
          </Box>
          <HStack w={390}>
            <Button
              alignSelf="center"
              bg="#6ACA70"
              borderRadius="full"
              variant="primary"
              width={'100%'}
              disabled={
                txStep == TxStep.Estimating ||
                txStep == TxStep.Posting ||
                txStep == TxStep.Broadcasting ||
                (isWalletConnected && claimableRewards === 0)
              }
              maxWidth={570}
              isLoading={
                txStep == TxStep.Estimating ||
                txStep == TxStep.Posting ||
                txStep == TxStep.Broadcasting
              }
              onClick={async () => {
                if (isWalletConnected) {
                  await submit(ActionType.claim, null, null)
                } else {
                  onOpenModal()
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
          <WalletModal
            isOpenModal={isOpenModal}
            onCloseModal={onCloseModal}
            chainId={chainId}
          />
        </VStack>
      )}
    </>
  )
}

export default RewardsComponent
