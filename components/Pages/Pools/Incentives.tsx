import { useMemo } from 'react';
import {
  Button, Text, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody,
  Table,
  Thead,
  Tbody, Tr, Td, TableContainer
} from '@chakra-ui/react';
import { IncentivesLogos } from './IncentivesLogos';

export const Incentives = ({ flows }) => {
  const { logos = [], more = [], hasIncentives = false } = useMemo(() => {
    const logos = flows.slice(0, 2).map((flow) => flow?.logoURI);
    const more = flows.slice(3).length;
    const hasIncentives = flows.length > 0;
    return { logos, more, hasIncentives };

  }, [flows]);

  //show dash if no incentives
  if (!hasIncentives)
    return <Text>-</Text>;

  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <Button variant="unstyled">
          <IncentivesLogos logos={logos} more={more} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        background="black"
        boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
        borderRadius="15px"
        border="unset"
        width="auto"
      >
        <PopoverArrow
          bg="black"
          boxShadow="unset"
          style={{ boxShadow: 'unset' }}
          sx={{ '--popper-arrow-shadow-color': 'black' }} />
        <PopoverBody>
          {/* TODO: add incentives table */}
          <TableContainer>
            <Table size='sm' variant="unstyled">
              <Thead>
                <Tr border="0">
                  <Td color="gray.500">Token</Td>
                  <Td color="gray.500">Estimate Daily Reward</Td>
                  <Td color="gray.500" isNumeric>APR</Td>
                </Tr>
              </Thead>
              <Tbody>
                <Tr borderBottom={"1px solid rgba(255, 255, 255, 0.1)"}>
                  <Td color="white">ATOM</Td>
                  <Td color="white">109</Td>
                  <Td color="white" isNumeric>0.04%</Td>
                </Tr>
                <Tr borderBottom={"1px solid rgba(255, 255, 255, 0.1)"}>
                  <Td color="white">JUNO</Td>
                  <Td color="white">109</Td>
                  <Td color="white" isNumeric>0.04%</Td>
                </Tr>
                <Tr borderBottom={"1px solid rgba(255, 255, 255, 0.1)"}>
                  <Td color="white">WHALE</Td>
                  <Td color="white">109</Td>
                  <Td color="white" isNumeric>0.04%</Td>
                </Tr>
                <Tr>
                  <Td color="white">USDC</Td>
                  <Td color="white">109</Td>
                  <Td color="white" isNumeric>0.04%</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
