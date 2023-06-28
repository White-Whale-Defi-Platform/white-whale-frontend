import { HStack, Text, VStack } from '@chakra-ui/react'
import { TooltipWithChildren } from 'components/TooltipWithChildren'

type Props = {
  multiplicator: string
  apr: string
  show: boolean
}

const Multiplicator = ({ multiplicator, apr, show }: Props) => {
  if (!show) return null

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
          label="Multiplicator"
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
        <Text fontSize="15px" color="brand.50">
          Estimated APR
        </Text>

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
