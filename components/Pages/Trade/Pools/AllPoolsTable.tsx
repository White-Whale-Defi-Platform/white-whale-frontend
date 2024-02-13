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
  Spinner,
} from '@chakra-ui/react'
import {
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { IncentiveTooltip } from 'components/InfoTooltip'
import Loader from 'components/Loader'
import Apr from 'components/Pages/Trade/Pools/components/Apr'
import { Liquidity } from 'components/Pages/Trade/Pools/components/Liquidity'
import PoolName from 'components/Pages/Trade/Pools/components/PoolName'
import { Pool } from 'components/Pages/Trade/Pools/types/index'
import { kBg, kBorderRadius } from 'constants/visualComponentConstants'
import { formatPrice } from 'libs/num'

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
  columnHelper.accessor((row) => row.apr, {
    id: 'apr',
    header: () => (
      <Text align="right" color="brand.50" display="inline">
        {'APR'}
      </Text>
    ),
    cell: (info) => (info.getValue() === -1 ? <Spinner alignSelf={'right'} textAlign={'right'} color="white" size="xs" /> : info.getValue() === 'n/a' ? (
      <Text>n/a</Text>
    ) : (
      <Apr
        apr={`${Number(info.getValue()).toFixed(2)}`}
        flows={info.row.original.flows}
      />
    )),
  }),
  columnHelper.accessor((row) => row.volume24hr, {
    id: 'volume24hr',
    header: () => <Text align="right" color="brand.50" display="inline">
      24hr Volume
    </Text>,
    cell: (info) => (info.getValue() === -1 ? <Spinner color="white" size="xs" />
      : <Text align="right">{info.getValue() === 'n/a' ? info.getValue() : `$${formatPrice(info.getValue())}`}</Text>),
  }),
  columnHelper.accessor((row) => row.totalLiq, {
    id: 'totalLiq',
    header: () => <Text align="right" color="brand.50" display="inline">Total Liquidity</Text>,
    cell: (info) => <Liquidity
      liquidity={`$${formatPrice(info.getValue())}`}
      infos={info.row.original}
    />,
  }),
  columnHelper.accessor('incentives', {
    header: () => (
      <HStack paddingTop={'4'}>
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
        width={{ base: 'full',
          xl: 'container.xl' }}
        background={kBg}
        boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
        borderRadius={kBorderRadius}
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
        background={kBg}
        boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
        borderRadius={kBorderRadius}
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
      background={kBg}
      boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
      borderRadius={kBorderRadius}
      display={['none', 'none', 'none', 'flex']}
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
                      header.id === 'action' || header.id === 'incentives' || header.id === 'pool'
                        ? null
                        : header.column.getToggleSortingHandler()
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header,
                        header.getContext())}
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
