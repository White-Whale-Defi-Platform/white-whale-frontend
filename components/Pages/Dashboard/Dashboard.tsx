import React, { FC, useEffect, useState } from 'react'

import { Divider, VStack } from '@chakra-ui/react'
import Loader from 'components/Loader'
import { ChainStat, DashboardPieChart } from 'components/Pages/Dashboard/DashboardPieChart'
import { Header } from 'components/Pages/Dashboard/Header'
import { useGetBondingAprs } from 'components/Pages/Dashboard/hooks/useGetBondingAprs'
import { StatsTable } from 'components/Pages/Dashboard/StatsTable'
import { WalletChainName } from 'constants/index'
import { getChainLogoUrlByName } from 'util/getChainLogoUrlByName'
import { getDashboardData } from 'util/getDashboardData'

export type DashboardData = {
  logoUrl: string
  chainName: string
  tvl: number
  volume24h: number
  apr: number
}
export const Dashboard: FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([])
  const [initialized, setInitialized] = useState<boolean>(false)
  const { data: aprs, isLoading } = useGetBondingAprs()

  useEffect(() => {
    const fetchDashboardData = async () => {
      const mockData = await getDashboardData()
      const mappedDashboardData = mockData.map((data) => {
        const apr = aprs.find((apr) => apr.chainName === data.chainName)?.apr
        return ({
          logoUrl: getChainLogoUrlByName(data.chainName),
          chainName: data.chainName === WalletChainName.terra ? 'Terra' : data.chainName === WalletChainName.terrac ? 'Terra-Classic' : data.chainName,
          tvl: data.tvl,
          volume24h: data.volume24h,
          apr: apr ? apr : 0,
        } as DashboardData)
      })
      setDashboardData(mappedDashboardData)
      setInitialized(true)
    }
    if (!initialized && !isLoading) {
      fetchDashboardData()
    }
  }, [initialized, isLoading])
  return <VStack width={'full'}>
    <Header dashboardData={dashboardData}/>
    <Divider borderColor="white"/>
    {!initialized && <Loader /> }
    {initialized && <><StatsTable dashboardData={dashboardData} initialized={initialized} />
      <DashboardPieChart dashboardData={dashboardData} chainStat={ChainStat.apr} />
      <DashboardPieChart dashboardData={dashboardData} chainStat={ChainStat.tvl} />
      <DashboardPieChart dashboardData={dashboardData} chainStat={ChainStat.volume24h} /></>
    }
  </VStack>
}
