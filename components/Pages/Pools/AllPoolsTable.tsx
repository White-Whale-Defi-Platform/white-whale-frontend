import React from 'react'

import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import {
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  chakra,
  HStack,
} from '@chakra-ui/react'
import {
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import Loader from '../../Loader'
import Apr from './components/Apr'
import Liquidity from './components/liquidity'
import PoolName from './components/PoolName'
import { Pool } from './types'
import { IncentiveTooltip } from '../../InfoTooltip'

const columnHelper = createColumnHelper<Pool>()

const columns = [
  columnHelper.accessor('pool', {
    header: () => (
      <Text color="brand.50" display="inline">
        Pool
      </Text>
    ),
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
      <Text align="right" color="brand.50" display="inline">
        {'RATIO'}
      </Text>
    ),
    cell: (info) => <Text align="right">{info.getValue()}</Text>,
  }),
  columnHelper.accessor('apr', {
    header: () => (
      <Text align="right" color="brand.50" display="inline">
        {'APR'}
      </Text>
    ),
    cell: (info) =>
      info.getValue() === 'n/a' ? (
        <Text>{info.getValue()}</Text>
      ) : (
        <Apr
          apr={info.getValue()?.toString()}
          flows={info.row.original.flows}
        />
      ),
  }),
  columnHelper.accessor('volume24hr', {
    header: () => (
      <Text align="right" color="brand.50" display="inline">
        {'24hr Volume'}
      </Text>
    ),
    cell: (info) => <Text align="right">{info.getValue()}</Text>,
  }),
  columnHelper.accessor('totalLiq', {
    header: () => (
      <Text align="right" color="brand.50" display="inline">
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
  columnHelper.accessor('incentives', {
    header: () => (
      <HStack paddingTop={'4'}>
        <IncentiveTooltip IconSize={'3'} />
        <Text align="left" color="brand.50">
          {'Incentives'}
        </Text>
      </HStack>
    ),
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('action', {
    header: () => (
      <Text align="left" color="brand.50" display="inline">
        Action
      </Text>
    ),
    cell: (info) => info.getValue(),
  }),
]

const AllPoolsTable = ({
  pools,
  isLoading,
}: {
  pools: Pool[]
  isLoading: boolean
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data: pools,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  if (isLoading || !pools) {
    return (
      <Flex
        padding={10}
        width={['full', '1160px']}
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
        width={['full', '1160px']}
        background={'#1C1C1C'}
        boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
        borderRadius="30px"
        justifyContent="center"
      >
        <Text py={10} color="white">
          {'All remaining pools will appear here.'}
        </Text>
      </Flex>
    )
  }

  return (
    <Flex
      padding={10}
      width={['full', 'auto']}
      background={'#1C1C1C'}
      boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
      borderRadius="30px"
      display={['none', 'flex']}
      flexDirection="column"
    >
      <TableContainer width="full">
        <Table variant="unstyled">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th
                    key={header.id}
                    color="brand.50"
                    onClick={
                      header.id === 'action' || header.id === 'incentives'
                        ? null
                        : header.column.getToggleSortingHandler()
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    <chakra.span pl="2">
                      {header.column.getIsSorted() ? (
                        header.column.getIsSorted() === 'desc' ? (
                          <TriangleDownIcon aria-label="sorted descending" />
                        ) : (
                          <TriangleUpIcon aria-label="sorted ascending" />
                        )
                      ) : null}
                    </chakra.span>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  )
}

export default AllPoolsTable
