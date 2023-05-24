import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { HStack, Table, TableContainer, Tbody, Td, Th, Thead, Tr, VStack, Text } from '@chakra-ui/react';
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import React, { useState } from 'react'
import dayjs from "dayjs"


type Props = {
    columnFilters: any;
    positions: any[];
}
type TableProps = {
    startDate: string;
    endDate: string;
    value: string;
    action: JSX.Element;
    state: string;
}
const columnHelper = createColumnHelper<TableProps>()

const formatDate = (date) => {
    const newDate = new Date(date * 1000)
    return newDate.toLocaleDateString()
}

const columns = [
    columnHelper.accessor('startDate', {
        header: () => <Text as="span" color="brand.50" fontSize="sm" textTransform="capitalize">Start Date</Text>,
        enableSorting: true,
    }),
    columnHelper.accessor('endDate', {
        header: () => <Text as="span" color="brand.50" fontSize="sm" textTransform="capitalize">End Date</Text>,

        // header: (info) => {
        //     return (
        //         <TooltipWithChildren label={`Value($${totalDollarValue})`} isHeading={true}>
        //             <AvailableRewards data={totlaValue} />
        //         </TooltipWithChildren>
        //     )
        // },
        // cell: (info) => {
        //     const assets = info?.row?.original?.assets || []
        //     return (
        //         <TooltipWithChildren label={`$${Number(info.getValue()).toFixed(2)}`}>
        //             <AvailableRewards data={assets} />
        //         </TooltipWithChildren>
        //     )
        // },
        enableSorting: true,

    }),
    columnHelper.accessor('value', {
        // header: () => (
        //     <TooltipWithChildren label="Weight" isHeading={true} showTooltip={false} />
        // ),
        enableSorting: true,
    }),
    columnHelper.accessor('action', {
        header: () => (
            <Text
                as="span"
                color="brand.50"
                fontSize="sm"
                textTransform="capitalize"
            >
                Action
            </Text>
        ),
        cell: (info) => info.getValue(),
        enableSorting: false
    }),
    columnHelper.accessor('state', {}),
]

const PositionsTable = ({ positions, columnFilters }: Props) => {

    const [sorting, setSorting] = useState<any>([{
        desc: false,
        id: "startDate"
    }]);

    const table = useReactTable({
        data: positions || [],
        columns: columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility: {
                duration: true,
                value: true,
                weight: true,
                action: true,
                state: false,
            }
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <TableContainer color="white" width="full" >

            <Table size='md' variant="unstyled" margin="auto" width="full">
                <Thead
                    borderBottom="1px solid rgba(255, 255, 255, 0.1)"
                    color="gray"

                >
                    {table?.getHeaderGroups().map((headerGroup, index) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Th
                                    key={header.id} color="brand.50"
                                    cursor={header.column.getCanSort() ? "pointer" : "default"}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <HStack>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}

                                        {header?.column?.columnDef?.enableSorting && (
                                            <VStack width="fit-content" p="0" m="0" spacing="0">
                                                <TriangleUpIcon fontSize="8px" color={header.column.getIsSorted() == 'asc' ? "white" : "gray"} />
                                                <TriangleDownIcon fontSize="8px" color={header.column.getIsSorted() === 'desc' ? "white" : "gray"} />
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
                        <Tr key={row.id} borderBottom={index !== table.getRowModel().rows.length - 1 && "1px solid rgba(255, 255, 255, 0.1)"}>
                            {row.getVisibleCells().map((cell) => {
                                return (
                                    <Td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Td>
                                );
                            })}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    )
}

export default PositionsTable