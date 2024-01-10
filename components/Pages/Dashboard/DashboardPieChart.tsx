import React, { useEffect, useState } from 'react'

import { HStack, Text } from '@chakra-ui/react';
import CustomPieChart from 'components/Pages/Dashboard/CustomPieChart'
import { DashboardData } from 'components/Pages/Dashboard/Dashboard'
import { getColorByChainName } from 'util/getColorByChainName'

export enum ChainStat { tvl= 'TVL', volume24h='Volume', apr='APR' }

export const DashboardPieChart = ({ dashboardData, chainStat }: {dashboardData: DashboardData[], chainStat: ChainStat}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const totalValue = dashboardData.reduce((acc, data) => acc + (chainStat === ChainStat.tvl ? data.tvl : chainStat === ChainStat.volume24h ? data.volume24h : data.apr), 0)
    const adjustedData = dashboardData.map((data) => {
      const value = (chainStat === ChainStat.tvl ? data.tvl : chainStat === ChainStat.volume24h ? data.volume24h : data.apr)
      return ({
        name: (data.chainName.charAt(0).toUpperCase() + data.chainName.slice(1)),
        value,
        color: getColorByChainName(data.chainName),
        percentage: `${((value / totalValue) * 100).toFixed(2)}%`,
      })
    })
    setData(adjustedData)
  }, [dashboardData])

  return (
    <HStack
      alignItems="center"
      alignSelf={'center'}
      justify={'center'}
      width="full"
      borderRadius="30px"
      backgroundColor="transparent"
      px="35"
    >
      <Text
        as="h3"
        fontSize="20"
        fontWeight="900"
        style={{ textTransform: 'capitalize' }}>{chainStat === ChainStat.tvl ? ChainStat.tvl : chainStat === ChainStat.volume24h ? ChainStat.volume24h : ChainStat.apr}</Text>
      <CustomPieChart data={data} chainStat={chainStat} />
    </HStack>
  )
}
