import {
  Box,
  Flex,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from '@chakra-ui/react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import Loader from '../../Loader'
import Apr from './components/Apr'
import PoolName from './components/PoolName'
import Volume from './components/Volume'
import { Pool } from './types'
import InfoIcon from 'components/icons/InfoIcon'

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
        {`RATIO`}
      </Text>
    ),
    cell: (info) => {
      return <Text align="right">{info.getValue()}</Text>
    },
  }),
  columnHelper.accessor('apr', {
    header: () => (
      <HStack>
        <Tooltip
          label={
            <Box
              width="230px"
              borderRadius="10px"
              bg="black"
              color="white"
              fontSize={14}
              p={4}
            >
              {'Pool APR plus incentive APR'}
            </Box>
          }
          bg="transparent"
          hasArrow={false}
          placement="bottom"
          closeOnClick={false}
          arrowSize={0}
        >
          <Box>
            <InfoIcon color={'white'} cursor="pointer" />
          </Box>
        </Tooltip>
        <Text align="right" color="brand.50">
          {`APR`}
        </Text>
      </HStack>
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
    cell: (info) => <Text align="right">{info.getValue()}</Text>,
  }),
  columnHelper.accessor('incentives', {
    header: () => (
      <Text align="right" color="brand.50">
        Incentives
      </Text>
    ),
    cell: (info) => {
      return info.getValue()
    },
  }),
  columnHelper.accessor('action', {
    header: () => (
      <Text align="left" color="brand.50">
        Action
      </Text>
    ),
    cell: (info) => {
      return info.getValue()
    },
  }),
]

const PoolsTable = ({
  pools,
  isLoading,
}: {
  pools: Pool[]
  isLoading: boolean
}) => {
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
      width={['full', 'auto']}
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
    </Flex>
  )
}

export default PoolsTable
