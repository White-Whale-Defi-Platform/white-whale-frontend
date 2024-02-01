import React, { useState } from 'react';

import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { Box, HStack, Text, VStack, Image } from '@chakra-ui/react'
import {
  ColumnDef,
  createColumnHelper, flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { DashboardData } from 'components/Pages/Dashboard/Dashboard'
import { WalletChainName } from 'constants/index'
import { formatPrice } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

const columnHelper = createColumnHelper<DashboardData>()

const columns: ColumnDef<DashboardData, any>[] = [
  columnHelper.accessor('logoUrl', {
    header: () => null,
    cell: (info) => (
      <Image
        src={info.getValue()}
        width="auto"
        maxW="1.6rem"
        maxH="1.6rem"
      />
    ),
  }),
  columnHelper.accessor('chainName', {
    header: () => (
      <Text
        as="span"
        color="white"
        fontWeight={'bold'}
        fontSize="16px"
        textTransform="capitalize">
        Chain
      </Text>
    ),
    cell: (info) => <Text fontWeight={'bold'}>{info.getValue() === WalletChainName.terra ? 'Terra' : info.getValue() === WalletChainName.terrac ? 'Terra-Classic' : info.getValue().charAt(0).
      toUpperCase() + info.getValue().slice(1)}</Text>,
  }),
  columnHelper.accessor('tvl', {
    enableSorting: true,
    header: () => (
      <Text
        as="span"
        color="white"
        fontSize="16px"
        fontWeight={'bold'}>
        Total Value Locked
      </Text>
    ),
    cell: (info) => <Text fontWeight={'bold'}>{`$${formatPrice(info.getValue())}`}</Text>,
  }),
  columnHelper.accessor('volume24h', {
    enableSorting: true,
    header: () => (
      <Text
        as="span"
        color="white"
        minW="150px"
        fontSize="16px"
        fontWeight={'bold'}>
        Volume 24h
      </Text>
    ),
    cell: (info) => <Text fontWeight={'bold'}>{`$${formatPrice(info.getValue())}`}</Text>,
  }),
  columnHelper.accessor('apr', {
    enableSorting: true,
    header: () => (
      <Text
        as="span"
        color="white"
        minW="150px"
        fontSize="16px"
        fontWeight={'bold'}
      >
        Bonding APR
      </Text>
    ),
    cell: (info) => <Text fontWeight={'bold'}>{ info.getValue() === 0 ? '-' : `${info.getValue().toFixed(2)}%`}</Text>,
  }),
]

export const StatsTable = ({ dashboardData }) => {
  const { walletChainName } = useRecoilValue(chainState)
  const [sorting, setSorting] = useState<any>([
    {
      desc: true,
      id: 'tvl',
    },
  ])

  const table = useReactTable({
    data: dashboardData,
    columns,
    state: {
      sorting,
      columnVisibility: {
        duration: true,
        value: true,
        weight: true,
        action: true,
        status: false,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <VStack width="full" borderRadius={'30px'} pb={5}>
      {table.getHeaderGroups()?.map((headerGroup) => (
        <HStack
          key={headerGroup.id}
          width="full"
          py="4"
          px="8"
          position="relative">
          {headerGroup.headers.map((header, index) => (
            <Box
              key={header.id}
              minW={index === 0 ? '150px' : index === 1 ? '200px' : index === 2 ? '250px' : index === 3 ? '225px' : index === 4 ? '145px' : 'unset' }
              cursor={header.column.getCanSort() ? 'pointer' : 'default'}
              onClick={header.column.getToggleSortingHandler()}
            >
              <HStack>
                <Box fontSize={20}>
                  {flexRender(header.column.columnDef.header,
                    header.getContext())}
                </Box>
                {header.column?.columnDef?.enableSorting && (
                  <VStack width="fit-content" p="0" m="0" spacing="0">
                    <TriangleUpIcon
                      fontSize="8px"
                      color={
                        header.column.getIsSorted() === 'asc' ? 'white' : 'white.600'
                      }
                    />
                    <TriangleDownIcon
                      fontSize="8px"
                      color={
                        header.column.getIsSorted() === 'desc'
                          ? 'white'
                          : 'white.600'
                      }
                    />
                  </VStack>
                )}
              </HStack>
            </Box>
          ))}
        </HStack>
      ))}
      {table.getRowModel().rows?.filter((row) => row.original.chainName === walletChainName).map((row) => (
        <HStack
          key={row.id}
          width="full"
          borderRadius="10px"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          py="5"
          px="8"
          border={'2px solid #00FFB0'}>
          {row.getVisibleCells().map((cell, index) => (
            <React.Fragment key={cell.id}><Text
              minW={index === 0 ? '150px' : index === 1 ? '200px' : index === 2 ? '250px' : index === 3 ? '225px' : index === 4 ? '145px' : 'unset'}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Text>
            {index === 4 ? <Text pl={20} color={'#00FFB0'}>Selected</Text> : null}
            </React.Fragment>
          ))}
        </HStack>
      ))}
      {table.getRowModel().rows?.filter((row) => row.original.chainName !== walletChainName).map((row) => (
        <HStack
          key={row.id}
          width="full"
          borderRadius="10px"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          py="5"
          px="8"
          border={walletChainName === row.original.chainName ? '2px solid #00FFB0' : 'none'}
        >
          {row.getVisibleCells().map((cell, index) => (
            <React.Fragment key={cell.id}><Text
              minW={index === 0 ? '150px' : index === 1 ? '200px' : index === 2 ? '250px' : index === 3 ? '225px' : index === 4 ? '145px' : 'unset'}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Text>
            </React.Fragment>
          ))}
        </HStack>
      ))}
      {(dashboardData?.length === 0) && (
        <Text color="brand.50" fontSize="sm" textTransform="capitalize">
          Chain data currently not available...
        </Text>
      )}
    </VStack>
  );
};

