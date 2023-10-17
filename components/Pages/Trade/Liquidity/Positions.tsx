import { useState } from 'react'

import { Box, Button, Divider, HStack } from '@chakra-ui/react'
import { PositionsTable } from 'components/Pages/Trade/Liquidity/PositionsTable'
import { PositionState } from 'constants/state'

type Props = {
  positions: any[]
}

export const Positions = ({ positions }: Props) => {
  const [activeButton, setActiveButton] = useState(PositionState.all)
  const [columnFilters, setColumnFilters] = useState([])

  return (
    <Box width="full">
      <HStack
        margin="20px"
        backgroundColor="rgba(0, 0, 0, 0.25)"
        width="auto"
        px="24px"
        py="12px"
        borderRadius="75px"
        gap="20px"
      >
        {[PositionState.all, PositionState.active, PositionState.unbonding, PositionState.withdraw].map((item) => (
          <Button
            key={item}
            minW="120px"
            variant={activeButton === item ? 'primary' : 'unstyled'}
            color="white"
            size="sm"
            onClick={() => {
              setActiveButton(item)
              setColumnFilters(item === PositionState.all
                ? []
                : [
                  {
                    id: 'state',
                    value: item,
                  },
                ])
            }}
            textTransform="capitalize"
          >
            {item}
          </Button>
        ))}
      </HStack>

      <Divider opacity="0.2" />

      <PositionsTable columnFilters={columnFilters} positions={positions} />
    </Box>
  )
}
