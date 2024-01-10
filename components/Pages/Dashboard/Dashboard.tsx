import React, { FC, useEffect } from 'react'

import { Divider, VStack } from '@chakra-ui/react'
import Loader from 'components/Loader'
import { ChainStat, DashboardPieChart } from 'components/Pages/Dashboard/DashboardPieChart'
import { Header } from 'components/Pages/Dashboard/Header'
import { useGetBondingAprs } from 'components/Pages/Dashboard/hooks/useGetBondingAprs'
import { StatsTable } from 'components/Pages/Dashboard/StatsTable'
import { WalletChainName } from 'constants/index'
import { useRecoilState } from 'recoil'
import { dashboardDataState } from 'state/dashboardDataState'
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
  const [dashboardState, setDashboardDataState] = useRecoilState(dashboardDataState)
  const { data: aprs, isLoading } = useGetBondingAprs()

  useEffect(() => {
    const fetchDashboardData = async () => {
      const mockData = await getDashboardData()
      const mappedDashboardData = mockData.map((data) => {
        const apr = aprs.find((apr) => apr.chainName === data.chainName)?.apr
        return ({
          logoUrl: getChainLogoUrlByName(data.chainName),
          chainName: data.chainName,
          tvl: data.tvl,
          volume24h: data.volume24h,
          apr: apr ? apr : 0,
        } as DashboardData)
      })
      setDashboardDataState({
        data: mappedDashboardData,
        isInitialized: true })
    }
    if (!dashboardState.isInitialized && !isLoading) {
      fetchDashboardData()
    }
  }, [dashboardState.isInitialized, isLoading])

  return <VStack width={'full'}>
    <Header dashboardData={dashboardState.data}/>
    <Divider borderColor="white"/>
    {!dashboardState.isInitialized && <Loader /> }
    {dashboardState.isInitialized && <><StatsTable dashboardData={dashboardState.data} />
      <DashboardPieChart dashboardData={dashboardState.data} chainStat={ChainStat.apr} />
      <DashboardPieChart dashboardData={dashboardState.data} chainStat={ChainStat.tvl} />
      <DashboardPieChart dashboardData={dashboardState.data} chainStat={ChainStat.volume24h} /></>
    }
  </VStack>
}
