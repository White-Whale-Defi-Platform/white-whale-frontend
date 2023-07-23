import { HStack, VStack } from '@chakra-ui/react'
import { TooltipWithChildren } from 'components/TooltipWithChildren'

type Props = {
  multiplicator: string
  apr: string
  show: boolean
}

const Multiplicator = ({ multiplicator, apr, show }: Props) => {
  if (!show) {
    return null
  }

  return (
    <VStack
      justifyContent="space-between"
      width="full"
      border="1px solid rgba(255, 255, 255, 0.1)"
      borderRadius="15px"
      p={4}
      pt={3.5}
      style={{ marginBottom: 50 }}
    >
      <HStack justifyContent="space-between" width="full">
        <TooltipWithChildren
          label="Multiplier"
          children={'Factor by which your APR gets multiplied.'}
          isHeading
          fontSize="16"
        />

        <TooltipWithChildren
          label={multiplicator}
          fontSize="16"
          showTooltip={false}
        />
      </HStack>
      <HStack justifyContent="space-between" width="full">
        <TooltipWithChildren
          label="Estimated APR"
          children={
            'Multiplier 0 is the base APR generated by fees. Multiplier 1 is the APR with incentives.\n' +
            'Above 1, the incentive APR is multiplied by the multiplier that increases up to 16 linearly , if you lock your tokens for 365 days.'
          }
          isHeading
          fontSize="16"
        />

        <TooltipWithChildren
          label={`${apr}%`}
          fontSize="16"
          showTooltip={false}
        />
      </HStack>
    </VStack>
  )
}

export default Multiplicator
