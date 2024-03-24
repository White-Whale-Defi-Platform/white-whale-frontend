import React, { FC, useEffect } from 'react'

import { HStack, Text, VStack } from '@chakra-ui/react'
import Loader from 'components/Loader'
import { Header } from 'components/Pages/Dashboard/Header'
import { StatsTable } from 'components/Pages/Dashboard/StatsTable'
import { usePrices } from 'hooks/usePrices'
import { useRecoilState } from 'recoil'
import { dashboardDataState } from 'state/dashboardDataState'
import { getChainLogoUrlByName } from 'util/getChainLogoUrlByName'

import { useGetDashboardDataAPI } from './hooks/getDashboardDataAPI'

export type DashboardData = {
  logoUrl: string
  chainName: string
  tvl: number
  volume24h: number
  apr: number
  buyback: number
}
export const Dashboard: FC = () => {
  const [dashboardState, setDashboardDataState] = useRecoilState(dashboardDataState)
  const { data: dashData, isLoading } = useGetDashboardDataAPI()
  const prices = usePrices()
  useEffect(() => {
    const fetchDashboardData = async () => {
      const circulatingWhaleSupply = dashData.supply?.circulating / (10 ** 6) || 0
      const marketCap = circulatingWhaleSupply * (prices?.WHALE || 0)
      const mappedDashboardData = dashData.dashboardData?.map((data) => {
        const apr = dashData.bondingInfos[data.chainName].bondingAPR
        const buyback = dashData.bondingInfos[data.chainName].bondingAPR?.buyback
        return ({
          logoUrl: getChainLogoUrlByName(data.chainName),
          chainName: data.chainName,
          tvl: data.tvl,
          volume24h: data.volume24h,
          apr: apr ? apr : 0,
          buyback: buyback ? buyback : 0,
        } as DashboardData)
      })
      setDashboardDataState({
        ...dashboardState,
        data: mappedDashboardData,
        whalePrice: prices?.WHALE ? prices.WHALE : 0,
        marketCap: marketCap ? marketCap : 0,
        isInitialized: prices?.WHALE !== 0 && marketCap !== 0,
      })
    }
    if (!dashboardState.isInitialized) {
      fetchDashboardData()
    }
  }, [prices, dashboardState.isInitialized, isLoading])

  return <VStack width={'full'}>
    {dashboardState.isInitialized && <Header dashboardData={dashboardState.data} />}
    {!dashboardState.isInitialized && (<HStack
      paddingTop={'20%'}
      width="full"
      alignContent="center"
      justifyContent="center"
      alignItems="center">
      <Loader />
    </HStack>)}
    {dashboardState.isInitialized && <StatsTable dashboardData={dashboardState.data} />}
    {dashboardState.isInitialized && <HStack alignSelf={'start'}><Text fontWeight={'bold'}>{`Total Daily Dex Buybacks: ${dashboardState.data.reduce((acc, data) => acc + data.buyback, 0).toFixed(2)} WHALE`}</Text></HStack>}
  </VStack>
}
