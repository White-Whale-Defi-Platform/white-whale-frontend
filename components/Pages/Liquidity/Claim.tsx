import { useMemo } from 'react'

import { HStack, VStack } from '@chakra-ui/react'
import { useConfig } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { useCheckIncentiveSnapshots } from 'components/Pages/Liquidity/hooks/useCheckIncentiveSnapshots'
import useForceEpochAndTakingSnapshots from 'components/Pages/Liquidity/hooks/useForceEpochAndTakingSnapshots'
import SubmitButton from 'components/SubmitButton'
import { TooltipWithChildren } from 'components/TooltipWithChildren'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { TxStep } from 'types/common'

import ClaimTable from './ClaimTable'
import { useClaim } from './hooks/useClaim'
import useRewards from './hooks/useRewards'
import { useClients } from 'hooks/useClients'

const AvailableRewards = ({ totalValue }: { totalValue: string }) => (
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

  const { network, chainId, chainName } = useRecoilValue(chainState)
  const { cosmWasmClient } = useClients(chainName)

  const config = useConfig(network, chainId)
  // Check if there are all snapshots for incentives for current taken, if not return those on which no ss was performed
  const noSnapshotTakenAddresses = useCheckIncentiveSnapshots(
    cosmWasmClient,
    config
  )
  const allSnapshotsTaken = useMemo(
    () => noSnapshotTakenAddresses.length === 0,
    [noSnapshotTakenAddresses.length]
  )
  const forceSnapshots = useForceEpochAndTakingSnapshots({
    noSnapshotTakenAddresses,
    config,
  })
  const { rewards = [], totalValue } = useRewards(poolId)
  // Check if there are rewards to claim
  const isClaimable = useMemo(() => {
    const rewardsSum = rewards.reduce((acc, reward) => acc + Number(reward.assetAmount),
      0)
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
