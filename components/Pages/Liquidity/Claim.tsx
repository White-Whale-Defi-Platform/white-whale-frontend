import { HStack, VStack } from '@chakra-ui/react'
import SubmitButton from 'components/SubmitButton'
import { TooltipWithChildren } from 'components/TooltipWithChildren'
import { useMemo } from 'react'
import { TxStep } from 'types/common'
import ClaimTable from './ClaimTable'
import { useClaim } from './hooks/useClaim'
import useRewards from './hooks/useRewards'
import useForceEpochAndTakingSnapshots from 'components/Pages/Liquidity/hooks/useForceEpochAndTakingSnapshots'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { useCheckIncentiveSnapshots } from 'components/Pages/Liquidity/hooks/useCheckIncentiveSnapshots'
import { useConfig } from 'components/Pages/Dashboard/hooks/useDashboardData'

const AvailableRewards = ({ totalValue }: { totalValue: number }) => (
  <HStack
    justifyContent="space-between"
    width="full"
    border="1px solid rgba(255, 255, 255, 0.1)"
    borderRadius="15px"
    p={4}
    pt={3.5}
  >
    <TooltipWithChildren
      label="Available Rewards"
      isHeading
      fontSize="16"
      showTooltip={false}
    />

    <TooltipWithChildren
      label={`$${totalValue}`}
      fontSize="16"
      showTooltip={false}
    />
  </HStack>
)

type Props = {
  poolId: string
}

const Claim = ({ poolId }: Props) => {
  const claim = useClaim({ poolId })

  const { client, network, chainId } = useRecoilValue(walletState)

  const config = useConfig(network, chainId)
  // check if there are all snapshots for incentives for current taken, if not return those on which no ss was performed
  const noSnapshotTakenAddresses = useCheckIncentiveSnapshots(client, config)
  const allSnapshotsTaken = useMemo(() => {
    return noSnapshotTakenAddresses.length === 0
  }, [noSnapshotTakenAddresses.length])
  const forceSnapshots = useForceEpochAndTakingSnapshots({
    noSnapshotTakenAddresses: noSnapshotTakenAddresses,
    config: config,
  })
  const { rewards = [], totalValue } = useRewards(poolId)

  // check if there are rewards to claim
  const isClaimable = useMemo(() => {
    const rewardsSum = rewards.reduce((acc, reward) => {
      return acc + Number(reward.assetAmount)
    }, 0)
    return rewardsSum > 0
  }, [rewards])

  return (
    <VStack gap={10} py={5}>
      <AvailableRewards totalValue={totalValue} />

      <ClaimTable tokens={rewards} />

      <SubmitButton
        label={allSnapshotsTaken ? 'Claim' : 'Take Snapshots'}
        isConnected={true}
        txStep={TxStep.Ready}
        isDisabled={!isClaimable && allSnapshotsTaken}
        isLoading={claim.isLoading}
        onClick={
          allSnapshotsTaken
            ? () => claim.submit()
            : () => forceSnapshots.submit()
        }
      />
    </VStack>
  )
}

export default Claim
