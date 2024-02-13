import { useMemo } from 'react'

import { HStack, VStack } from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import { useConfig } from 'components/Pages/Bonding/hooks/useDashboardData'
import ClaimTable from 'components/Pages/Trade/Liquidity/ClaimTable'
import { useCheckIncentiveSnapshots } from 'components/Pages/Trade/Liquidity/hooks/useCheckIncentiveSnapshots'
import { useClaim } from 'components/Pages/Trade/Liquidity/hooks/useClaim'
import useForceEpochAndTakingSnapshots from 'components/Pages/Trade/Liquidity/hooks/useForceEpochAndTakingSnapshots'
import useRewards from 'components/Pages/Trade/Liquidity/hooks/useRewards'
import SubmitButton from 'components/SubmitButton'
import { TooltipWithChildren } from 'components/TooltipWithChildren'
import { useClients } from 'hooks/useClients'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { TxStep } from 'types/common'

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

  const { network, chainId, walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected, openView } = useChain(walletChainName)
  const { cosmWasmClient } = useClients(walletChainName)

  const config = useConfig(network, chainId)
  // Check if there are all snapshots for incentives for current taken, if not return those on which no ss was performed
  const noSnapshotTakenAddresses = useCheckIncentiveSnapshots(cosmWasmClient,
    config)
  const allSnapshotsTaken = useMemo(() => noSnapshotTakenAddresses.length === 0,
    [noSnapshotTakenAddresses.length])
  const forceSnapshots = useForceEpochAndTakingSnapshots({
    noSnapshotTakenAddresses,
    config,
  })
  const { rewards = [], totalValue } = useRewards(poolId)
  // Check if there are rewards to claim
  const isClaimable = useMemo(() => {
    const rewardsSum = rewards.reduce((acc, reward) => acc + Number(reward.amount),
      0)
    return rewardsSum > 0
  }, [rewards])
  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) {
      return 'Connect Wallet'
    } else if (Number(totalValue) === 0) {
      return 'No Rewards'
    } else if (!allSnapshotsTaken) {
      return 'Take Snapshots'
    }
    return 'Claim'
  }, [isWalletConnected, totalValue, allSnapshotsTaken])
  return (
    <VStack gap={10} py={5}>
      <AvailableRewards totalValue={totalValue} />

      <ClaimTable tokens={rewards} />
      <SubmitButton
        label={buttonLabel}
        isConnected={true}
        txStep={TxStep.Ready}
        isDisabled={(!isClaimable && allSnapshotsTaken) && isWalletConnected}
        isLoading={ [TxStep.Estimating, TxStep.Posting, TxStep.Broadcasting].includes(claim.txStep)}
        onClick={() => {
          if (isWalletConnected && allSnapshotsTaken && rewards.length !== 0) {
            claim.submit()
          } else if (!isWalletConnected) {
            openView()
          } else {
            forceSnapshots.submit()
          }
        }
        }

      />
    </VStack>
  )
}

export default Claim
