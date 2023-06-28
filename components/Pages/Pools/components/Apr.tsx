import React, { useMemo } from 'react'

import {
  Button,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { FlowData } from 'components/Pages/Incentivize/hooks/useIncentivePoolInfo'

type Props = {
  apr: string
  flows: FlowData[]
  isMyPools: boolean
  myIncentiveApr?: string
}

const Apr = ({ apr, flows, myIncentiveApr, isMyPools = false }: Props) => {
  const totalApr = useMemo(() => {
    const incentiveApr = isMyPools
      ? myIncentiveApr
      : flows.reduce((total, item) => {
          return total + (isNaN(item.apr) ? 0 : Number(item.apr))
        }, 0)
    return Number(apr.replace('%', '')) + Number(incentiveApr)
  }, [flows, apr, myIncentiveApr])

  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <Button variant="unstyled">
          <HStack borderBottom="1px dotted rgba(255, 255, 255, 0.5)" h="30px">
            <Text align="right">{totalApr.toFixed(2)}%</Text>
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        background={'black'}
        boxShadow={'0px 0px 50px rgba(0, 0, 0, 0.25)'}
        borderRadius="5px"
        border="unset"
        width="auto"
      >
        <PopoverArrow
          bg="black"
          boxShadow="unset"
          style={{ boxShadow: 'unset' }}
          sx={{ '--popper-arrow-shadow-color': 'black' }}
        />
        <PopoverBody>
          {/* TODO: add incentives table */}
          <TableContainer>
            <Table size="sm" variant="unstyled">
              <Thead>
                <Tr border="0">
                  <Td color="gray.500">Source</Td>
                  <Td color="gray.500" isNumeric>
                    APR
                  </Td>
                </Tr>
              </Thead>
              <Tbody>
                <Tr
                  borderBottom={
                    flows.length === 0
                      ? 'none'
                      : '1px solid rgba(255, 255, 255, 0.1)'
                  }
                >
                  <Td color="white">Fees</Td>
                  <Td color="white" isNumeric>
                    {apr}
                  </Td>
                </Tr>
                {flows?.map((flowInfo, index) => (
                  <Tr
                    key={flowInfo?.tokenSymbol + '_' + index}
                    borderBottom={
                      index < flows.length - 1
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : 'unset'
                    }
                  >
                    <Td color="white">
                      {flowInfo?.tokenSymbol ?? 'Unknown'} Incentive
                    </Td>
                    <Td color="white" isNumeric>
                      {isNaN(flowInfo?.apr)
                        ? '-'
                        : !isMyPools
                        ? `${flowInfo?.apr.toFixed(2)}% - ${(
                            flowInfo?.apr * 16
                          ).toFixed(2)}%`
                        : `${(flowInfo?.apr * 16).toFixed(2)}%`}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default Apr
