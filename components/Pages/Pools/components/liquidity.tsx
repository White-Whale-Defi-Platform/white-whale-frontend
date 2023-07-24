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

type Props = {
  liquidity: string
  infos: any
}

const Liquidity = ({ liquidity, infos }: Props) => {

  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <Button variant="unstyled">
          <HStack borderBottom="1px dotted rgba(255, 255, 255, 0.5)" h="30px">
            <Text align="right">{liquidity}</Text>
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
                  <Td color="gray.500"></Td>
                  {infos.poolAssets?.map((name)=>(<Td key={name.symbol} color="gray.500" isNumeric>{name.symbol}</Td>))}
                </Tr>
              </Thead>
              <Tbody>
                <Tr
                >
                  <Td color="white">Token in Pool</Td>
                  {infos.liquidity.reserves.total.map((amount: number, index: string | number)=>
                  // eslint-disable-next-line react/jsx-key
                  (<Td color="gray.500" isNumeric>
                    {(amount / (Math.pow(10,infos.poolAssets[index].decimals))).toFixed(2)}
                    </Td>
                    ))}
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default Liquidity
