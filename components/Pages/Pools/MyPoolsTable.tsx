import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'

import { Flex, Button, HStack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'

import PoolName from './PoolName'
import { useEffect, useState } from 'react'
import Loader from '../../Loader'

export type Pool = {
    pool: string
    token1Img: string
    token2Img: string
    myPosition?: number | string
    apr: number | string
    volume24hr: number | string
    totalLiq: number | string
    cta?: () => void
}

const columnHelper = createColumnHelper<Pool>()

const columns = [
    columnHelper.accessor('pool', {
        header: () => <Text color="brand.50">Pool</Text>,
        cell: info => (
            <PoolName
                poolId={info.getValue()}
                token1Img={info.row.original?.token1Img}
                token2Img={info.row.original?.token2Img}
            />
        )
    }),
    columnHelper.accessor('myPosition', {
        header: () => <Text align="right" color="brand.50">My Position</Text>,
        cell: info => <Text align="right">${info.getValue()}</Text>,
    }),
    columnHelper.accessor('apr', {
        header: () => <Text align="right" color="brand.50">APR</Text>,
        cell: info => <Text align="right">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('volume24hr', {
        header: () => <Text align="right" color="brand.50">24hr Volume</Text>,
        cell: info => <Text align="right">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('totalLiq', {
        header: () => <Text align="right" color="brand.50">Total Liquidity</Text>,
        cell: info => <Text align="right">${info.getValue()}</Text>,
    }),
    columnHelper.accessor('cta', {
        header: '',
        cell: info => (
            <HStack justifyContent="flex-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => info.getValue()()}
                >
                    Manage Liquidity
                </Button>
            </HStack>
        )
    })
]

const PoolsTable = ({ pools = [], isLoading }: { pools: Pool[], isLoading: boolean }) => {

    const [data, setData] = useState(() => [...pools])

    useEffect(() => {
        setData(pools)
    }, [pools])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    if (isLoading) {
        return (
            <Flex padding={10} width={["full", "1160px"]}
                background="#1C1C1C"
                boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
                borderRadius="30px"
                justifyContent="center"
                >
                    <Loader />
            </Flex>
        )
    }

    if (!pools.length) {
        return (
            <Flex padding={10} width={["full", "1160px"]}
                background="#1C1C1C"
                boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
                borderRadius="30px"
                justifyContent="center"
                >
                    <Text py={10} color="white"> Your active liquidity positions will appear here. </Text>
            </Flex>
        )
    }
    
    

    return (
        <Flex padding={10} width={["full", "1170px"]}
            background="#1C1C1C"
            boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
            borderRadius="30px"
            display={['none', 'flex']}
            >
            <TableContainer width="full" >
                <Table variant='unstyled'>
                    <Thead>
                        {table.getHeaderGroups().map((headerGroup, index) => (
                            <Tr key={headerGroup.id} >
                                {headerGroup.headers.map(header => (
                                    <Th key={header.id} color="brand.50">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </Thead>
                    <Tbody>
                        {table.getRowModel().rows.map((row, index) => (
                            <Tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
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

export default PoolsTable