import { HStack, VStack } from '@chakra-ui/react'
import SubmitButton from 'components/SubmitButton'
import { TooltipWithChildren } from 'components/TooltipWithChildren'
import { TxStep } from 'types/common'
import ClaimTable from './ClaimTable'
import { useClaim } from './hooks/useClaim'
import useRewards from './hooks/useRewards'

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
  const { rewards = [], totalValue } = useRewards(poolId)

  return (
    <VStack gap={10} py={5}>
      <AvailableRewards totalValue={totalValue} />

      <ClaimTable tokens={rewards} />

      <SubmitButton
        label="Claim"
        isConnected={true}
        txStep={TxStep.Ready}
        isDisabled={Number(totalValue) === 0}
        isLoading={claim.isLoading}
        onClick={() => claim.submit()}
      />
    </VStack>
  )
}

export default Claim
