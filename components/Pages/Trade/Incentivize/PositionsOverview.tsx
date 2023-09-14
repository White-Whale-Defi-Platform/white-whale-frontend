import { useMemo, useState } from 'react'

import {
  Box,
  Button,
  HStack,
  Image,
  Text,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react'
import { num } from 'libs/num'

import { useClosePosition } from 'components/Pages/Trade/Incentivize/hooks/useClosePosition'
import PositionsTable from 'components/Pages/Trade/Incentivize/PositionsTable'

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

export const PositionsOverview = ({ flows, poolId }: Props) => {
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
  // TODO: Responsive Design
  return (
    <Box
      border="2px"
      borderColor="whiteAlpha.200"
      borderRadius="3xl"
      pt="8"
      maxH="fit-content"
    >
      <Tabs variant="brand">
        <TabList
          display={['flex']}
          flexWrap={['wrap']}
          justifyContent="center"
          background={'#1C1C1C'}
        >
          {STATES.map((item) => (
            <Tab key={`tab-${item}`}
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
            </Tab>
          ))}
        </TabList>
        <TabPanels p={4}>
          {STATES.map((item) => (
            <TabPanel key={item} padding={4}>
              <PositionsTable
                columnFilters={columnFilters}
                positions={positions}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  )
}

