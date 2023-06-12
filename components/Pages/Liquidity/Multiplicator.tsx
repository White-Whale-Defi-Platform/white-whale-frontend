import { HStack } from '@chakra-ui/react'
import { TooltipWithChildren } from 'components/TooltipWithChildren'

type Props = {
  multiplicator: string
  show: boolean
}

const Multiplicator = ({ multiplicator, show }: Props) => {
  if (!show) return null

  return (
    <HStack
      justifyContent="space-between"
      width="full"
      border="1px solid rgba(255, 255, 255, 0.1)"
      borderRadius="15px"
      p={4}
      pt={3.5}
      style={{ marginBottom: 50 }}
    >
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
  )
}

export default Multiplicator
