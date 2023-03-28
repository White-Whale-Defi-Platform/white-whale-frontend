import {
    VStack, Text, HStack, Divider, Tabs, TabList, Tab, TabPanels, TabPanel, Button, Box,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
} from "@chakra-ui/react"
import { createColumnHelper, getCoreRowModel, useReactTable, flexRender, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table"
import { useState } from "react"
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import { TooltipWithChildren } from "components/TooltipWithChildren"

type Props = {}

const AvailableRewards = ({ data = [] }) => (
    <VStack minWidth="150px" alignItems="flex-start">
        {data.map(({ key, value }, index) => (
            <HStack key={index} justifyContent="space-between" width="full">
                <Text>{key}</Text>
                <Text>{value}</Text>
            </HStack>
        ))}
    </VStack>
)

const Rewards = () => (
    <VStack
        alignItems="flex-start"
        p="20px"
        border="1px solid rgba(255, 255, 255, 0.1)"
        filter="drop-shadow(0px 0px 50px rgba(0, 0, 0, 0.25))"
        borderRadius="15px"
        // transform="matrix(1, 0, 0, -1, 0, 0)"
        width="full"
    >

        <HStack width="full" justifyContent="space-between">
            <Text fontSize="14px" color="whiteAlpha.700">Available Rewards</Text>
            <TooltipWithChildren label="$3434343">
                <AvailableRewards data={[
                    { key: "USDC", value: "$343434" },
                    { key: "USDC", value: "$343434" },
                    { key: "USDC", value: "$343434" },
                ]} />
            </TooltipWithChildren>
        </HStack>

        <Divider />

        <HStack width="full" justifyContent="space-between" >
            <Text fontSize="14px" color="whiteAlpha.700">Estimated Daily Rewards</Text>
            <TooltipWithChildren label="$34343">
                <AvailableRewards data={[
                    { key: "USDC", value: "$343434" },
                    { key: "USDC", value: "$343434" },
                    { key: "USDC", value: "$343434" },
                ]} />
            </TooltipWithChildren>
        </HStack>

    </VStack>
)

type TableProps = {
    duration: string;
    value: string;
    weight: string;
    action: JSX.Element;
    state: string;
}

const tableData = [
    {
        duration: "0 days",
        value: "$43,454",
        weight: "5",
        state : "active",
        action: null,
    },
    {
        duration: "4 days",
        value: "$5656454",
        weight: "6",
        state : "active",
        action: <Button width="full" variant="outline" size="sm" >Unbund</Button>,
    },
    {
        duration: "9 days",
        value: "$121454",
        weight: "7",
        state : "unbounding",
        action: <Button width="full" variant="outline" size="sm" disabled={true}>Unbounding</Button>
    }
]

const columnHelper = createColumnHelper<TableProps>()

const columns = [
    columnHelper.accessor('duration', {
        header: () => <Text as="span" color="brand.50" fontSize="sm" textTransform="capitalize">Duration</Text>,
    }),
    columnHelper.accessor('value', {
        header: () => (
            <TooltipWithChildren label="Value($343434)" isHeading={true}>
                <AvailableRewards data={[
                    { key: "USDC", value: "$343434" },
                    { key: "USDC", value: "$343434" },
                    { key: "USDC", value: "$343434" },
                ]} />
            </TooltipWithChildren>
        ),
        cell: (info) => (
            <TooltipWithChildren label={info.getValue()}>
                <AvailableRewards data={[
                    { key: "USDC", value: "$343434" },
                    { key: "USDC", value: "$343434" },
                    { key: "USDC", value: "$343434" },
                ]} />
            </TooltipWithChildren>
        )

    }),
    columnHelper.accessor('weight', {
        header: () => (
            <TooltipWithChildren label="Weight" isHeading={true}>
                <AvailableRewards data={[
                    { key: "USDC", value: "$343434" },
                    { key: "USDC", value: "$343434" },
                    { key: "USDC", value: "$343434" },
                ]} />
            </TooltipWithChildren>
        )
    }),
    columnHelper.accessor('action', {
        header: '',
        cell: (info) => info.getValue(),
        enableSorting: false
    }),
    columnHelper.accessor('state', {}),
]


const AllTable = ({columnFilters}) => {
    const [sorting, setSorting] = useState<any>([{
        desc: false,
        id: "duration"
    }])
    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility : {
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
    })

    return (
        <TableContainer color="white" width="full">
            <Table size='md' variant="unstyled" margin="auto" width="fit-content">
                <Thead
                    borderBottom="1px solid rgba(255, 255, 255, 0.1)"
                    color="gray"
                >
                    {table.getHeaderGroups().map((headerGroup, index) => (
                        <Tr key={headerGroup.id} >
                            {headerGroup.headers.map((header) => (
                                <Th
                                    key={header.id} color="brand.50"
                                    cursor={header.column.getCanSort() ? "pointer" : "default"}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    {
                                        flexRender(
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
                                )
                            })}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    )
}

const TableTabs = () => {

    const [activeButton, setActiveButton] = useState("all")
    const [columnFilters, setColumnFilters] = useState([])

    return (
        <Box
            width="full"
        >
            <HStack
                margin="20px"
                backgroundColor="rgba(0, 0, 0, 0.25)"
                width="auto"
                px="24px"
                py="12px"
                borderRadius="75px"
                gap="20px"
            >
                {
                    ["all", "active", "unbounding"].map((item) => (
                        <Button
                            key={item}
                            minW="120px"
                            variant={activeButton === item ? "primary" : "unstyled"}
                            color="white"
                            size="sm"
                            onClick={() => {
                                setActiveButton(item)
                                setColumnFilters(item === "all" ? [] : [{
                                    id: "state",
                                    value: item
                                }])
                            }}
                            textTransform="capitalize"
                        >
                            {item}
                        </Button>
                    ))

                }
            </HStack>
            <Divider opacity="0.2" />
            <AllTable columnFilters={columnFilters} />
        </Box >
    )
}
// const TableTabs = () => (
//     <Tabs
//         variant='soft-rounded'
//         width="full"
//     >
//         <TabList
//             margin="20px"
//             backgroundColor="rgba(0, 0, 0, 0.25)"
//             width="auto"
//             px="24px"
//             py="12px"
//             borderRadius="75px"
//         >
//             {
//                 ['All', 'Active', 'Unbound'].map((tab, index) => (
//                     <Tab
//                         key={index}
//                         _selected={{ color: 'white', bg: 'brand.500' }}
//                         border="unset"
//                         minW="100px"
//                         color="white"
//                     >
//                         {tab}
//                     </Tab>
//                 ))
//             }
//         </TabList>
//         <Divider opacity="0.2" />
//         <TabPanels>
//             <TabPanel>
//                 <AllTable />
//             </TabPanel>
//             <TabPanel>
//                 <Text>Active</Text>
//             </TabPanel>
//             <TabPanel>
//                 <Text>Unbound</Text>
//             </TabPanel>
//         </TabPanels>
//     </Tabs>
// )


const Overview = (props: Props) => {
    return (

        <VStack alignItems="flex-start" gap="16px">
            <Rewards />

            <Box backgroundColor="#151515" width="full" borderRadius="15px">
                <TableTabs />
            </Box>


        </VStack>


    )
}

export default Overview