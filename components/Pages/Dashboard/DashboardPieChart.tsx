import React, { useEffect, useState } from 'react'

import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { DashboardData } from 'components/Pages/Dashboard/Dashboard'
import { Cell, Pie, PieChart } from 'recharts'
import { getColorByChainName } from 'util/getColorByChainName'

export enum ChainStat { tvl= 'TVL', volume24h='Volume', apr='APR' }

export const DashboardPieChart = ({ dashboardData, chainStat }: {dashboardData: DashboardData[], chainStat: ChainStat}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const totalValue = dashboardData.reduce((acc, data) => acc + (chainStat === ChainStat.tvl ? data.tvl : chainStat === ChainStat.volume24h ? data.volume24h : data.apr), 0)
    const adjustedData = [...dashboardData].sort((a, b) => (chainStat === ChainStat.volume24h ? b.volume24h - a.volume24h : b.tvl - a.tvl)).map((data) => {
      const value = (chainStat === ChainStat.tvl ? data.tvl : chainStat === ChainStat.volume24h ? data.volume24h : data.apr)
      const name = data.chainName === 'terra2' ? 'terra' : data.chainName === 'terra' ? 'terra-Classic' : data.chainName
      return ({
        name: (name.charAt(0).toUpperCase() + name.slice(1)),
        value,
        color: getColorByChainName(data.chainName),
        percentage: `${((value / totalValue) * 100).toFixed(2)}%`,
      })
    })
    setData(adjustedData)
  }, [dashboardData])

  return (
    <HStack
      alignItems="end"
      alignSelf={'center'}
      justifyItems={'start'}
      width="full"
      borderRadius="30px"
      backgroundColor="transparent"
    >
      <PieChart width={175} height={150}>
        <Pie
          dataKey="value"
          data={data}
          cx="40%"
          cy="50%"
          innerRadius={40}
          outerRadius={70}
          stroke={'none'}
        > {
            data?.map((_: any, index: number) => (
              <Cell key={`cell-${index}`} fill={data[index].color} />
            ))}
        </Pie>
      </PieChart>
      <VStack alignItems="flex-start" spacing={0} width={100} mt={-5}>
        {
          data?.map((_: any, index: number) => (
            <HStack key={index}>
              <Box bg={data[index].color} w="2" h="2" borderRadius="50%" mr="2"></Box>
              <Text color="white" fontSize={13} fontWeight={'bold'}>
                {data[index].name}
              </Text>
            </HStack>
          ))}
      </VStack>
    </HStack>
  )
}
