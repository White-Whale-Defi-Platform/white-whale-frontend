import {
  Button,
  Flex,
  HStack,
  Image,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { formatPrice } from 'libs/num'

import Loader from '../../Loader'
import Apr from './components/Apr'
import PoolName from './components/PoolName'
import Volume from './components/Volume'
import useIgnoreCoinhall from './hooks/useIgnoreCoinhall'
import { Pool } from './types'

const columnHelper = createColumnHelper<Pool>()

const columns = [
  columnHelper.accessor('pool', {
    header: () => <Text color="brand.50">Pool</Text>,
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
      <Text align="right" color="brand.50">
        {`price`}
      </Text>
    ),
    cell: (info) => {
      return <Text align="right">{info.getValue()}</Text>
    },
  }),
  columnHelper.accessor('apr', {
    header: () => (
      <Text align="right" color="brand.50">
        {`APR`}
      </Text>
    ),
    cell: (info) => {
      return (
        <>
          {info.row.original.isSubqueryNetwork ? (
            <Apr
              pairAddr={info.row.original.contract}
              tvl={info.row.original.totalLiq}
            />
          ) : (
            <Text align="right">{info.getValue()}</Text>
          )}
        </>
      )
    },
  }),
  columnHelper.accessor('volume24hr', {
    header: () => (
      <Text align="right" color="brand.50">
        {`24hr Volume`}
      </Text>
    ),
    cell: (info) => {
      return (
        <>
          {info.row.original.isSubqueryNetwork ? (
            <Volume pairAddr={info.row.original.contract} />
          ) : (
            <Text align="right">{info.getValue()}</Text>
          )}
        </>
      )
    },
  }),
  columnHelper.accessor('totalLiq', {
    header: () => (
      <Text align="right" color="brand.50">
        {`Total Liquidity`}
      </Text>
    ),
    cell: (info) => (
      <Text align="right">{`$${formatPrice(info.getValue())}`}</Text>
    ),
  }),
  columnHelper.accessor('myPosition', {
    header: () => (
      <Text align="right" color="brand.50">
        {`My Position`}
      </Text>
    ),
    cell: (info) => <Text align="right">${info.getValue()}</Text>,
  }),
  columnHelper.accessor('cta', {
    header: '',
    cell: (info) => (
      <HStack justifyContent="flex-end">
        <Button variant="outline" size="sm" onClick={() => info.getValue()()}>
          {`Manage Liquidity`}
        </Button>
      </HStack>
    ),
  }),
]

const PoolsTable = ({
  show,
  pools,
  isLoading,
}: {
  show: boolean
  pools: Pool[]
  isLoading: boolean
}) => {
  if (!show) return null

  const datProvidedByCoinhall = useIgnoreCoinhall()

  const table = useReactTable({
    data: pools,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading || !pools) {
    return (
      <Flex
        padding={10}
        width={['full', '1160px']}
        background="#1C1C1C"
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
        background="#1C1C1C"
        boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
        borderRadius="30px"
        justifyContent="center"
      >
        <Text py={10} color="white">
          {`Your active liquidity positions will appear here.`}
        </Text>
      </Flex>
    )
  }

  return (
    <Flex
      px="30px"
      // padding={10}
      // width={['full', '1170px']}
      background="#212121"
      boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
      borderRadius="30px"
      display={['none', 'flex']}
      flexDirection="column"
    >
      <TableContainer width="full" overflowX="hidden">
        <Table variant="unstyled">
          <Thead>
            <Tr>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              <Th
                bg="rgba(255, 255, 255, 0.05)"
                p="2px"
                borderTopRadius="10px"
              ></Th>
              <Th isNumeric></Th>
            </Tr>
            {table.getHeaderGroups().map((headerGroup, index) => (
              <Tr key={headerGroup.id} >
                {headerGroup.headers.map((header) => (
                  <Th
                    key={header.id}
                    color="brand.50"
                    bg={
                      header.id === 'myPosition' && 'rgba(255, 255, 255, 0.05)'
                    }
                  >
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
              <Tr
                key={row.id}
                borderBottom={
                  index !== table.getRowModel().rows.length - 1 &&
                  '1px solid rgba(255, 255, 255, 0.1)'
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <Td
                    key={cell.id}
                    bg={
                      cell?.column?.id === 'myPosition' &&
                      'rgba(255, 255, 255, 0.05)'
                    }
                  >
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
              <Td
                bg="rgba(255, 255, 255, 0.05)"
                p="2px"
                borderBottomRadius="10px"
              ></Td>
              <Td p="unset">
                {datProvidedByCoinhall && (
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    gap="5px"
                    pb="8px"
                  >
                    <Text
                      color="white"
                      fontSize="12px"
                    >{`data provided by`}</Text>
                    <Image
                      src="/logos/coinhall.png"
                      alt="coinhall"
                      height="14px"
                    />
                  </Flex>
                )}
              </Td>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
      {/* {datProvidedByCoinhall && (
        <Flex justifyContent="end" alignItems="center" mt="16px">
          <Text
            color="white"
            fontSize="12px"
            mr="4px"
          >{`data provided by`}</Text>
          <Image src="/logos/coinhall.png" alt="coinhall" height="14px" />
        </Flex>
      )} */}
    </Flex>
  )
}

export default PoolsTable
