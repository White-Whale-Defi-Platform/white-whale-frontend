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
import { CHIHUAHUA_MAINNET_CHAIN_ID } from 'constants/chain'
import { formatPrice } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import Loader from '../../Loader'
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
      return <Text align="right">{info.getValue()}</Text>
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
  columnHelper.accessor('cta', {
    header: '',
    cell: (info) => (
      <HStack justifyContent="flex-end">
        <Button variant="outline" size="sm" onClick={() => info.getValue()()}>
          {`Add Liquidity`}
        </Button>
      </HStack>
    ),
  }),
]

const PoolsTable = ({
  pools,
  isLoading,
}: {
  pools: Pool[]
  isLoading: boolean
}) => {
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
          {`All remaining pools will appear here.`}
        </Text>
      </Flex>
    )
  }

  return (
    <Flex
      padding={10}
      width={['full', '1170px']}
      background="#1C1C1C"
      boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
      borderRadius="30px"
      display={['none', 'flex']}
      flexDirection="column"
    >
      <TableContainer width="full">
        <Table variant="unstyled">
          <Thead>
            {table.getHeaderGroups().map((headerGroup, index) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
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
      {datProvidedByCoinhall && (
        <Flex justifyContent="end" alignItems="center" mt="16px">
          <Text
            color="white"
            fontSize="12px"
            mr="4px"
          >{`data provided by`}</Text>
          <Image src="/logos/coinhall.png" alt="coinhall" height="14px" />
        </Flex>
      )}
    </Flex>
  )
}

export default PoolsTable
