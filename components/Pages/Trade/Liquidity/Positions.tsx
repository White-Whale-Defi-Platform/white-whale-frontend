import { useState } from 'react'

import { ChevronDownIcon } from '@chakra-ui/icons'
import { Box, Button, Divider, Menu, MenuButton, MenuItem, MenuList, Stack, useMediaQuery } from '@chakra-ui/react'
import { PositionsTable } from 'components/Pages/Trade/Liquidity/PositionsTable'
import { PositionState } from 'constants/state'

type Props = {
  positions: any[]
}

const menuOrTab = (
  activeButton:any, setActiveButton:any, setColumnFilters:any, isMobile:boolean,
) => {
  if (isMobile) {
    return (<Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} backgroundColor="rgba(0, 0, 0, 0.25)" color={'white'}>
        {activeButton.toUpperCase()}
      </MenuButton>
      <MenuList backgroundColor="rgba(0, 0, 0, 1)" >

        {[PositionState.all, PositionState.active, PositionState.unbonding, PositionState.withdraw].map((item) => (
          <MenuItem
            alignSelf={'center'}
            backgroundColor="rgba(0, 0, 0, 0.25)"
            key={item}
            color="white"
            minW="120px"
            maxWidth={'200px'}
            textTransform="capitalize"
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
            }}>{item}</MenuItem>

        ))}
      </MenuList>
    </Menu>)
  } else {
    return ([PositionState.all, PositionState.active, PositionState.unbonding, PositionState.withdraw].map((item) => (
      <Button
        alignSelf={'center'}
        key={item}
        minW="120px"
        maxWidth={'200px'}
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
    )))
  }
}

export const Positions = ({ positions }: Props) => {
  const [activeButton, setActiveButton] = useState(PositionState.all)
  const [columnFilters, setColumnFilters] = useState([])
  const [isMobile] = useMediaQuery('(max-width: 766px)')

  return (
    <Box width="full">
      <Stack
        direction={['column', 'column', 'row']}
        margin="20px"
        backgroundColor="rgba(0, 0, 0, 0.25)"
        width="auto"
        px="24px"
        py="12px"
        borderRadius="75px"
        gap={['10px', '10px', '20px']}
      >
        {menuOrTab(
          activeButton, setActiveButton, setColumnFilters, isMobile,
        )}
      </Stack>

      <Divider opacity="0.2" />

      <PositionsTable columnFilters={columnFilters} positions={positions} />
    </Box>
  )
}
