import { useMemo, useState } from 'react'

import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import {
  Box,
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
import { AvailableRewards } from 'components/Pages/Trade/Liquidity/AvailableRewards'
import { TooltipWithChildren } from 'components/TooltipWithChildren'

type TableProps = {
  duration: string
  value: string
  weight: string
  action: JSX.Element
  state: string
  assets: any[]
}

const columnHelper = createColumnHelper<TableProps>()

const columns = (totalValue, totalDollarValue) => [
  columnHelper.accessor('duration', {
    header: () => (
      <Text as="span" color="brand.50" fontSize="sm" textTransform="capitalize">
        Duration
      </Text>
    ),
    cell: (info) => <Text>{`${info.getValue()} days`}</Text>,
    enableSorting: true,
  }),
  columnHelper.accessor('value', {
    header: () => (
      <TooltipWithChildren
        label={`Value($${totalDollarValue})`}
        isHeading={true}
      >
        <AvailableRewards data={totalValue} />
      </TooltipWithChildren>
    ),
    cell: (info) => {
      const assets = info?.row?.original?.assets || []
      return (
        <TooltipWithChildren label={`$${Number(info.getValue()).toFixed(2)}`}>
          <AvailableRewards data={assets} />
        </TooltipWithChildren>
      )
    },
    enableSorting: true,
  }),
  columnHelper.accessor('weight', {
    header: () => (
      <TooltipWithChildren
        label="Weight"
        isHeading={true}
        showTooltip={false}
      />
    ),
    enableSorting: true,
  }),
  columnHelper.accessor('action', {
    header: () => (
      <Text as="span" color="brand.50" fontSize="sm" textTransform="capitalize">
        Action
      </Text>
    ),
    cell: (info) => info.getValue() || <Box w="full"></Box>,
    enableSorting: false,
  }),
  columnHelper.accessor('state', {}),
]

export const PositionsTable = ({ columnFilters, positions }) => {
  const [sorting, setSorting] = useState<any>([
    {
      desc: false,
      id: 'duration',
    },
  ])

  const totalDollarValue = useMemo(() => {
    const filter = columnFilters?.[0]?.value
    const filteredPositions = positions.filter((p) => (filter ? p.state === filter : true))
    return filteredPositions.reduce((acc, curr) => acc + curr.value, 0)
  }, [positions, columnFilters])

  // Loop through positions and get total value
  const assetsWithValue = useMemo(() => {
    const initialValue = { amount: 0,
      dollarValue: 0 }
    const filter = columnFilters?.[0]?.value
    const filteredPositions = positions.filter((p) => (filter ? p.state === filter : true))

    return filteredPositions?.
      map((p) => p?.assets || []).
      reduce((acc, curr) => {
        const [a1 = initialValue, a2 = initialValue] = acc
        const [c1 = initialValue, c2 = initialValue] = curr

        return [
          {
            ...c1,
            dollarValue: a1.dollarValue + c1.dollarValue || 0,
            amount: a1.amount + c1.amount || 0,
          },
          {
            ...c2,
            dollarValue: a2.dollarValue + c2.dollarValue || 0,
            amount: a2.amount + c2.amount || 0,
          },
        ]
      }, [])
  }, [positions, columnFilters])

  const customColumns = useMemo(() => columns(assetsWithValue, totalDollarValue.toFixed(2)),
    [assetsWithValue, totalDollarValue])

  const table = useReactTable({
    data: positions || [],
    columns: customColumns,
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
          {table.getHeaderGroups().map((headerGroup) => (
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
                            header.column.getIsSorted() == 'asc'
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
          {table.getRowModel().rows.map((row, index) => (
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
