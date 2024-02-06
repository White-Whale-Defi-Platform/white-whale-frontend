import { useMemo, useState } from 'react'

import { ChevronDownIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  HStack,
  Image,
  Text,
  Tab,
  TabList,
  Tabs,
  useMediaQuery,
  Menu,
  MenuItem,
  MenuList,
  MenuButton,
} from '@chakra-ui/react'
import { useClosePosition } from 'components/Pages/Trade/Incentivize/hooks/useClosePosition'
import PositionsTable from 'components/Pages/Trade/Incentivize/PositionsTable'
import { IncentiveState } from 'constants/state'
import { num } from 'libs/num'

type Props = {
  flows: any[]
  poolId: string
}

const STATES = [IncentiveState.all, IncentiveState.active, IncentiveState.upcoming, IncentiveState.over]

const menuOrTab = (
  activeButton: any, setActiveButton: any, setColumnFilters: any, isMobile: boolean,
) => {
  if (isMobile) {
    return (<Menu >
      <MenuButton padding={'6px'} width={'100%'} as={Button} rightIcon={<ChevronDownIcon />} backgroundColor="rgba(0, 0, 0, 0.25)" minW={'fit-content'} color={'white'} justifyContent={'center'}>
        {activeButton.toUpperCase()}
      </MenuButton>
      <MenuList backgroundColor="rgba(0, 0, 0, 1)" >
        {STATES.map((item) => (
          <MenuItem alignSelf={'center'}
            backgroundColor="rgba(0, 0, 0, 0.25)"
            key={item}
            color="brand.700"
            minW="120px"
            maxWidth={'200px'}
            textTransform="capitalize" onClick={() => {
              setActiveButton(item)
              setColumnFilters(item === IncentiveState.all
                ? []
                : [
                  {
                    id: 'state',
                    value: item,
                  },
                ])
            }}>{item}</MenuItem>))}
      </MenuList>
    </Menu>)
  } else {
    return (<Tabs variant="brand">
      <TabList
        display={['flex']}
        flexWrap={['wrap']}
        justifyContent="center"
        background={'black'}
        borderRadius={10}
      >
        {STATES.map((item) => (
          <Tab key={`tab-${item}`}
            onClick={() => {
              setActiveButton(item)
              setColumnFilters(item === IncentiveState.all
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
    </Tabs>)
  }
}

const CloseAction = ({ poolId, flowId, isCreator }) => {
  const close = useClosePosition({ poolId })

  return isCreator ? (
    <Button
      variant="outline"
      size="sm"
      borderColor="whiteAlpha.700"
      disabled={!isCreator}
      isLoading={close?.isLoading}
      onClick={() => close?.submit({ flowId })}
    >
      Close
    </Button>
  ) : <Box />
}

const Token = ({ imgUrl, symbol }) => (
  <HStack>
    <Image
      src={imgUrl}
      width="auto"
      style={{
        margin: 'unset',
        borderRadius: '50%',
      }}
      maxW="1.2rem"
      maxH="1.2rem"
      alt="token1-img"
    />
    <Text fontSize="sm">{symbol}</Text>
  </HStack>
)

export const IncentivePositionsOverview = ({ flows, poolId }: Props) => {
  const [isMobile] = useMediaQuery('(max-width: 755px)')
  const [activeButton, setActiveButton] = useState(IncentiveState.active)
  const [columnFilters, setColumnFilters] = useState([
    {
      id: 'state',
      value: IncentiveState.active,
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
    value: Math.round(num(flow.amount).
      div(10 ** (flow?.token?.decimals || 6)).
      toNumber()),
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
    <Box
      border="2px"
      borderColor="whiteAlpha.200"
      borderRadius="3xl"
      pt={['2', '2', '8']}
      maxH="fit-content"
    >
      {menuOrTab(
        activeButton, setActiveButton, setColumnFilters, isMobile,
      )}
      <PositionsTable
        columnFilters={columnFilters}
        positions={positions}
      />
    </Box>
  )
}

