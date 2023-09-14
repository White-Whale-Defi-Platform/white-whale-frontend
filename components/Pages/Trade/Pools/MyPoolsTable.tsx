import {
  Flex,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { IncentiveTooltip } from 'components/InfoTooltip'
import Loader from 'components/Loader'
import Apr from 'components/Pages/Trade/Pools/components/Apr'
import Liquidity from 'components/Pages/Trade/Pools/components/liquidity'
import PoolName from 'components/Pages/Trade/Pools/components/PoolName'
import { Pool } from 'components/Pages/Trade/Pools/types/index'

const columnHelper = createColumnHelper<Pool>()

const columns = [
  columnHelper.accessor('pool', {
    header: () => <Text color="brand.50">Pool</Text>,
    cell: (info) => (
      <PoolName
        poolId={info.getValue()}
        token1Img={info.row.original?.token1Img}
        token2Img={info.row.original?.token2Img}
      />
    ),
  }),
  columnHelper.accessor('price', {
    header: () => (
      <Text align="right" color="brand.50">
        {'RATIO'}
      </Text>
    ),
    cell: (info) => <Text align="right">{info.getValue()}</Text>,
  }),
  columnHelper.accessor('apr', {
    header: () => (
      <Text align="right" color="brand.50">
        {'APR'}
      </Text>
    ),
    cell: (info) => (info.getValue() === 'n/a' ? (
      <Text>{info.getValue()}</Text>
    ) : (
      <Apr
        apr={info.getValue()?.toString()}
        flows={info.row.original.flows}
      />
    )),
  }),
  columnHelper.accessor('volume24hr', {
    header: () => (
      <Text align="right" color="brand.50">
        {'24hr Volume'}
      </Text>
    ),
    cell: (info) => <Text align="right">{info.getValue()}</Text>,
  }),
  columnHelper.accessor('totalLiq', {
    header: () => (
      <Text align="right" color="brand.50">
        {'Total Liquidity'}
      </Text>
    ),
    cell: (info) => (
      <Liquidity
        liquidity={info.getValue()?.toString()}
        infos={info.row.original}
      />
    ),
  }),
  columnHelper.accessor('myPosition', {
    header: () => (
      <Text align="right" color="brand.50">
        {'My Position'}
      </Text>
    ),
    cell: (info) => <Text align="right">${info.getValue()}</Text>,
  }),
  columnHelper.accessor('incentives', {
    header: () => (
      <HStack>
        <IncentiveTooltip iconSize={'3'} />
        <Text align="left" color="brand.50">
          {'Incentives'}
        </Text>
      </HStack>
    ),
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('action', {
    header: () => (
      <Text align="left" color="brand.50">
        Action
      </Text>
    ),
    cell: (info) => info.getValue(),
  }),
]

const PoolsTable = ({
  show,
  pools,
  isLoading,
}: {
  show: boolean
  pools: Pool[]
  isLoading: boolean
}) => {
  if (!show) {
    return null
  }
  const table = useReactTable({
    data: pools,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading || !pools) {
    return (
      <Flex
        padding={10}
        width={['full', 'auto']}
        background={'#1C1C1C'}
        boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
        borderRadius="30px"
        justifyContent="center"
      >
        <Loader />
      </Flex>
    )
  }

  if (pools && !pools.length) {
    return (
      <Flex
        padding={10}
        width={['full', 'auto']}
        background={'#1C1C1C'}
        boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
        borderRadius="30px"
        justifyContent="center"
      >
        <Text py={10} color="white">
          {'Your active liquidity positions will appear here.'}
        </Text>
      </Flex>
    )
  }

  return (
    <Flex
      px="30px"
      background={'#212121'}
      boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
      borderRadius="30px"
      display={['none', 'flex']}
      flexDirection="column"
    >
      <TableContainer width="full" overflowX="hidden">
        <Table variant="unstyled">
          <Thead>
            <Tr>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              <Th
                bg="rgba(255, 255, 255, 0.05)"
                p="2px"
                borderTopRadius="10px"
              ></Th>
              <Th></Th>
              <Th isNumeric></Th>
            </Tr>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th
                    key={header.id}
                    color="brand.50"
                    bg={
                      header.id === 'myPosition' && 'rgba(255, 255, 255, 0.05)'
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header,
                        header.getContext())}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row, index) => (
              <Tr
                key={row.id}
                borderBottom={
                  index !== table.getRowModel().rows.length - 1 &&
                  '1px solid rgba(255, 255, 255, 0.1)'
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <Td
                    key={cell.id}
                    bg={
                      cell?.column?.id === 'myPosition' &&
                      'rgba(255, 255, 255, 0.05)'
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
          <Tfoot>
            <Tr>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td
                bg="rgba(255, 255, 255, 0.05)"
                p="2px"
                borderBottomRadius="10px"
              ></Td>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </Flex>
  )
}

export default PoolsTable
