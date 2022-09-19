import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'

import { Flex, Button, HStack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'

import VaultName from './VaultName'
import { useEffect, useState } from 'react'
import Loader from 'components/Loader'

export type Vault = {
    vaultId: string
    tokenImage: string
    apr: number | string
    cta?: () => void
    ctaLabel: string
    totalDeposts: string
    myDeposit: string
}

const columnHelper = createColumnHelper<Vault>()

const columns = [
    columnHelper.accessor('vaultId', {
        header: () => <Text color="brand.50">Vault</Text>,
        cell: info => (
            <VaultName
                vaultId={info.getValue()}
                tokenImage={info.row.original?.tokenImage}
            />
        )
    }),
    columnHelper.accessor('myDeposit', {
        header: () => <Text align="right" color="brand.50">My Deposit</Text>,
        cell: info => <Text align="right">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('apr', {
        header: () => <Text align="right" color="brand.50">APR</Text>,
        cell: info => <Text align="right">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('totalDeposts', {
        header: () => <Text align="right" color="brand.50">Total Deposits</Text>,
        cell: info => <Text align="right">{info.getValue()}</Text>,
    }),
    
    columnHelper.accessor('cta', {
        header: '',
        cell: info => (
            <HStack justifyContent="flex-end">
                <Button
                    variant="outline"
                    size="sm"
                    width="full"
                    maxWidth="200px"
                    onClick={() => info.getValue()()}
                >
                    {info?.row?.original?.ctaLabel}
                    {/* New Position */}
                </Button>
            </HStack>
        )
    })
]

const AllVaultsTable = ({ vaults = [], isLoading }: { vaults: Vault[], isLoading?: boolean }) => {

    const [data, setData] = useState(() => [...vaults])

    useEffect(() => {
        setData(vaults)
    }, [vaults])

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

    if (!vaults.length) {
        return (
            <Flex 
                padding={10} 
                width={["full", "1160px"]}
                background="#1C1C1C"
                boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
                borderRadius="30px"
                justifyContent="center"
                >
                    <Text py={10} color="white"> List of available vaults will appear here.</Text>
            </Flex>
        )
    }
    
    

    return (
        <Flex padding={10} width={["full", "1160px"]}
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

export default AllVaultsTable