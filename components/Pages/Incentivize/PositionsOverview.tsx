import React, { useMemo, useState } from 'react'

import { Box, Button, Divider, HStack, Image, Text } from '@chakra-ui/react'
import { num } from 'libs/num'

import { useClosePosition } from './hooks/useClosePosition'
import PositionsTable from './PositionsTable'

type Props = {
  flows: any[]
  poolId: string
}

const STATES = ['all', 'active', 'upcoming', 'over']

const CloseAction = ({ poolId, flowId, isCreator }) => {
  const close = useClosePosition({ poolId })

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!isCreator}
      isLoading={close?.isLoading}
      onClick={() => close?.submit({ flowId })}
    >
      Close
    </Button>
  )
}

const Token = ({ imgUrl, symbol }) => (
  <HStack>
    <Image
      src={imgUrl}
      width="auto"
      maxW="1.2rem"
      maxH="1.2rem"
      alt="token1-img"
    />
    <Text fontSize="sm">{symbol}</Text>
  </HStack>
)

const PositionsOverview = ({ flows, poolId }: Props) => {
  const [activeButton, setActiveButton] = useState('active')
  const [columnFilters, setColumnFilters] = useState([
    {
      id: 'state',
      value: 'active',
    },
  ])

  const positions = useMemo(() => flows.map((flow) => ({
    token: (
      <Token imgUrl={flow?.token?.logoURI} symbol={flow?.token?.symbol} />
    ),
    id: flow.flowId,
    state: flow.state,
    /*
     * StartDate: dayjs.unix(flow.startTime).format("YYYY/MM/DD"),
     * endDate: dayjs.unix(flow.endTime).format("YYYY/MM/DD"),
     */
    startDate: flow.startTime,
    endDate: flow.endTime,
    value: num(flow.amount).
      div(10 ** 6).
      toNumber(),
    action: (
      <CloseAction
        poolId={poolId}
        flowId={flow.flowId}
        isCreator={flow.isCreator}
      />
    ),
  })),
  [flows])

  if (positions.length === 0) {
    return (
      <Box width="full" textAlign="center">
        <Text color="whiteAlpha.700">No open positions</Text>
      </Box>
    )
  }

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
        {STATES.map((item) => (
          <Button
            key={item}
            minW="100px"
            variant={activeButton === item ? 'primary' : 'unstyled'}
            color="white"
            size="sm"
            onClick={() => {
              setActiveButton(item)
              setColumnFilters(item === 'all'
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

export default PositionsOverview
