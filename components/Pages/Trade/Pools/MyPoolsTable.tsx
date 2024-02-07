import React from 'react'

import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import {
  chakra, Divider,
  Flex,
  HStack, Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr, VStack,
} from '@chakra-ui/react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
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
      <Text>-</Text>
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
  columnHelper.accessor('myPosition', {
    id: 'myPosition',
    header: () => (
      <Text align="right" color="brand.50" display="inline">
        My Position
      </Text>
    ),
    cell: (info) => <Text align="right">{`$${formatPrice(info.getValue())}`}</Text>,
  }),
  columnHelper.accessor('incentives', {
    header: () => (
      <HStack paddingTop={4}>
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

const MyPoolsTable = ({
  show,
  pools,
  isLoading,
  aggregatedSupply,
  aggregatedAdjustedTotalPoolApr,
}: {
  show: boolean
  pools: Pool[]
  isLoading: boolean
  aggregatedSupply: number
  aggregatedAdjustedTotalPoolApr: number
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  if (!show) {
    return null
  }
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
        width={['full']}
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
        width={['full']}
        background={kBg}
        boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
        borderRadius={kBorderRadius}
        justifyContent="center">
        <Text py={10} color="white">
          {'Your active liquidity positions will appear here.'}
        </Text>
      </Flex>
    )
  }

  return (
    <Flex
      px="30px"
      background={kBg}
      maxWidth="container.xl"
      boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
      borderRadius={kBorderRadius}
      display={['none', 'none', 'none', 'flex']}
      flexDirection="column"
    >
      {<VStack ml={5} mr={45} mb={-9} mt={5} alignItems={'flex-start'}>
        <HStack mb={1}>
          <Text color={'brand.50'} fontWeight={'bold'} fontSize={13}>Total Supplied:</Text>
          <Text fontWeight={'bold'}>{`$${aggregatedSupply.toFixed(2)}`}</Text>
          <Divider orientation={'vertical'} height="20px" />
          <Text color={'brand.50'} fontWeight={'bold'} fontSize={13}>Total APR:</Text>
          <Text fontWeight={'bold'}>{`${aggregatedAdjustedTotalPoolApr.toFixed(2)}%`}</Text>
        </HStack>
        <Divider border={'0.5px solid rgba(255, 255, 255, 1)'} />
      </VStack>}
      <TableContainer width="full" overflowX="hidden">
        <Table variant="unstyled">
          <Thead>
            <Tr>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              <Th isNumeric></Th>
            </Tr>
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
              <Tr
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <Td key={cell.id}>
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
              <Td ></Td>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </Flex>
  )
}

export default MyPoolsTable
