import {
    Table,
    Thead,
    Tbody, Tr,
    Th,
    Td, TableContainer,
    Text,
    Box,
} from "@chakra-ui/react";
import { getCoreRowModel, useReactTable, flexRender, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table";
import { useState, useMemo, useEffect } from "react";
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { createColumnHelper } from "@tanstack/react-table"
import { TooltipWithChildren } from "components/TooltipWithChildren"
import { AvailableRewards } from "./AvailableRewards"
import { useTokenDollarValue } from "../../../hooks/useTokenDollarValue";
import { num } from "../../../libs/num";


type TableProps = {
    duration: string;
    value: string;
    weight: string;
    action: JSX.Element;
    state: string;
}

const columnHelper = createColumnHelper<TableProps>()

const columns = (totlaValue, totalDollarValue) => {
    
    return [
        columnHelper.accessor('duration', {
            header: () => <Text as="span" color="brand.50" fontSize="sm" textTransform="capitalize">Duration</Text>,
        }),
        columnHelper.accessor('value', {
            header: (info) => {
                return (
                    <TooltipWithChildren label={`Value($${totalDollarValue})`} isHeading={true}>
                        <AvailableRewards data={totlaValue} />
                    </TooltipWithChildren>
                )
            },
            cell: (info) => {
                const assets = info?.row?.original?.assets || []
                return (
                    <TooltipWithChildren label={info.getValue()}>
                        <AvailableRewards data={assets} />
                    </TooltipWithChildren>
                )
            }

        }),
        columnHelper.accessor('weight', {
            header: () => (
                <TooltipWithChildren label="Weight" isHeading={true} showTooltip={false} />
            )
        }),
        columnHelper.accessor('action', {
            header: () => (<Text
                as="span"
                color="brand.50"
                fontSize="sm"
                textTransform="capitalize"
            >
                Action
            </Text>),
            cell: (info) => info.getValue() || <Box w="full"></Box>,
            enableSorting: false
        }),
        columnHelper.accessor('state', {}),
    ]
}

const LineItem = ( {token, setTotalValue}) => {

    const [value] = useTokenDollarValue(token?.symbol)
    const dollarValue = !value ? 'na' : num(value).times(token?.amount).toFixed(2)
    
    useEffect(() => {
        setTotalValue((prev) => {
            // console.log({ dollarValue, token, value , prev})
            return dollarValue != 'na' ? num(prev).plus(dollarValue).dp(2).toNumber() : prev
        })
    }, [dollarValue])

    return null
}

const CalculateTotalValue = ( {tokens, setTotalValue}) => {

    return tokens?.map((token) => {
        return <LineItem token={token} setTotalValue={setTotalValue} />
    })
}


export const PositionsTable = ({ columnFilters, positions }) => {
    const [sorting, setSorting] = useState<any>([{
        desc: false,
        id: "duration"
    }]);
    const [totalDollarValue, setTotalValue] = useState(0)

    // loop through positions and get total value
    const totalValue = useMemo(() => {
        const initialValue = { amount: 0 };
        
        return positions?.reduce((acc, { assets = [] }) => {
          const [a1 = initialValue, a2 = initialValue] = acc;
          const [c1 = initialValue, c2 = initialValue] = assets;
          
          return [
            { ...c1, amount: (a1.amount + c1.amount) || 0 },
            { ...c2, amount: (a2.amount + c2.amount) || 0 }
          ];
        }, [initialValue]);
      }, [positions]);
      
      

    const customColumns = useMemo(() => {
        return columns(totalValue, totalDollarValue)
    }, [totalValue, totalDollarValue])

    const table = useReactTable({
        data: positions || [],
        columns : customColumns,
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

            {/* workaround to calculate total dollar value */}
            <CalculateTotalValue tokens={totalValue} setTotalValue={setTotalValue} />
            <Table size='md' variant="unstyled" margin="auto" width="full">
                <Thead
                    borderBottom="1px solid rgba(255, 255, 255, 0.1)"
                    color="gray"

                >
                    {table.getHeaderGroups().map((headerGroup, index) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Th
                                    key={header.id} color="brand.50"
                                    cursor={header.column.getCanSort() ? "pointer" : "default"}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}

                                    {{
                                        asc: <TriangleUpIcon color="white" ml="5px" mb="3px" />,
                                        desc: <TriangleDownIcon color="white" ml="5px" mb="3px" />,
                                    }[header.column.getIsSorted() as string] ?? null}

                                </Th>
                            ))}
                        </Tr>
                    ))}
                </Thead>
                <Tbody>
                    {table.getRowModel().rows.map((row, index) => (
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
    );
};
