import { useMemo } from 'react'

import {
  Button,
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

import { IncentivesLogos } from 'components/Pages/Trade/Pools/IncentivesLogos'

export const Incentives = ({ flows }) => {
  const {
    logos = [],
    more = [],
    hasIncentives = false,
  } = useMemo(() => {
    const logos = flows.slice(0, 2).map((flow) => flow?.logoURI)
    const more = flows.slice(3).length
    const hasIncentives = flows.length > 0
    return { logos,
      more,
      hasIncentives }
  }, [flows])

  // Show dash if no incentives
  if (!hasIncentives) {
    return <Text>-</Text>
  }
  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <Button variant="unstyled">
          <IncentivesLogos logos={logos} more={more} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        background={'black'}
        boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
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
                  <Td color="gray.500">Token</Td>
                </Tr>
              </Thead>
              <Tbody>
                {flows.map((flow, index) => (
                  <Tr
                    key={`${flow?.tokenSymbol}_${index}`}
                    borderBottom={
                      index < flows.length - 1
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : 'unset'
                    }
                  >
                    <Td color="white">{flow?.tokenSymbol ?? 'Unknown'}</Td>
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
