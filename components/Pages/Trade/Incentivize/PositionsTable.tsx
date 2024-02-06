import React, { useState } from 'react'

import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import {
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

type Props = {
  columnFilters: any
  positions: any[]
}
type TableProps = {
  token: JSX.Element
  startDate: string
  endDate: string
  value: string
  action: any
  state: string
}
const columnHelper = createColumnHelper<TableProps>()

const columns = [
  columnHelper.accessor('token', {
    header: () => (
      <Text as="span" color="brand.50" fontSize="sm" textTransform="capitalize">
        Token
      </Text>
    ),
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('startDate', {
    header: () => (
      <Text as="span" color="brand.50" fontSize="sm" textTransform="capitalize">
        Start Date
      </Text>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor('endDate', {
    header: () => (
      <Text as="span" color="brand.50" fontSize="sm" textTransform="capitalize">
        End Date
      </Text>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor('value', {
    enableSorting: true,
  }),
  columnHelper.accessor('action', {
    header: () => (
      <Text as="span" color="brand.50" fontSize="sm" textTransform="capitalize">
        Action
      </Text>
    ),
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('state', {}),
]

const PositionsTable = ({ positions, columnFilters }: Props) => {
  const [sorting, setSorting] = useState<any>([
    {
      desc: false,
      id: 'startDate',
    },
  ])

  const table = useReactTable({
    data: positions || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility: {
        duration: true,
        value: true,
        weight: true,
        action: true,
        state: false,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <TableContainer color="white" width="full">
      <Table size="md" variant="unstyled" margin="auto" width="full">
        <Thead borderBottom="1px solid rgba(255, 255, 255, 0.1)" color="gray">
          {table?.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Th
                  key={header.id}
                  color="brand.50"
                  cursor={header.column.getCanSort() ? 'pointer' : 'default'}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <HStack>
                    {flexRender(header.column.columnDef.header,
                      header.getContext())}

                    {header?.column?.columnDef?.enableSorting && (
                      <VStack width="fit-content" p="0" m="0" spacing="0">
                        <TriangleUpIcon
                          fontSize="8px"
                          color={
                            header.column.getIsSorted() === 'asc'
                              ? 'white'
                              : 'gray'
                          }
                        />
                        <TriangleDownIcon
                          fontSize="8px"
                          color={
                            header.column.getIsSorted() === 'desc'
                              ? 'white'
                              : 'gray'
                          }
                        />
                      </VStack>
                    )}
                  </HStack>
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table?.getRowModel().rows.map((row, index) => (
            <Tr
              key={row.id}
              borderBottom={
                index !== table.getRowModel().rows.length - 1 &&
                '1px solid rgba(255, 255, 255, 0.1)'
              }
            >
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
  )
}

export default PositionsTable
