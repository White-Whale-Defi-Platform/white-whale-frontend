import React, { FC, useEffect } from 'react'

import { VStack, Text, HStack } from '@chakra-ui/react'
import Loader from 'components/Loader'
import { Header } from 'components/Pages/Dashboard/Header'
import { useGetBondingAprsAndDailyBuybacks } from 'components/Pages/Dashboard/hooks/useGetBondingAprsAndDailyBuybacks'
import { StatsTable } from 'components/Pages/Dashboard/StatsTable'
import { useFetchCirculatingSupply } from 'hooks/useFetchCirculatingSupply'
import { usePrices } from 'hooks/usePrices'
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
  buyback: number
}
export const Dashboard: FC = () => {
  const [dashboardState, setDashboardDataState] = useRecoilState(dashboardDataState)
  const { data: aprAndBuybackData, isLoading } = useGetBondingAprsAndDailyBuybacks()
  const prices = usePrices()
  const circulatingWhaleSupply: number = useFetchCirculatingSupply()

  useEffect(() => {
    const fetchDashboardData = async () => {
      const dashboardData = await getDashboardData()
      const mappedDashboardData = dashboardData.map((data) => {
        const apr = aprAndBuybackData.find((d) => d.chainName === data.chainName)?.apr
        const buyback = aprAndBuybackData.find((d) => d.chainName === data.chainName)?.buyback
        return ({
          logoUrl: getChainLogoUrlByName(data.chainName),
          chainName: data.chainName,
          tvl: data.tvl,
          volume24h: data.volume24h,
          apr: apr ? apr : 0,
          buyback: buyback ? buyback : 0,
        } as DashboardData)
      })

      setDashboardDataState({ ...dashboardState,
        data: mappedDashboardData,
        isInitialized: true,
      })
    }
    if (!dashboardState.isInitialized && !isLoading) {
      fetchDashboardData()
    }
  }, [dashboardState.isInitialized, isLoading])

  useEffect(() => {
    const marketCap = circulatingWhaleSupply * (prices?.WHALE || 0)
    if (marketCap !== dashboardState.marketCap) {
      setDashboardDataState({ ...dashboardState,
        whalePrice: prices?.WHALE ? prices.WHALE : dashboardState.whalePrice,
        marketCap: marketCap ? marketCap : dashboardState.marketCap,
      })
    }
  }, [prices?.WHALE, circulatingWhaleSupply])

  return <VStack width={'full'}>
    <Header dashboardData={dashboardState.data}/>
    {!dashboardState.isInitialized && <Loader /> }
    {dashboardState.isInitialized && <StatsTable dashboardData={dashboardState.data} />}
    {dashboardState.isInitialized && <HStack alignSelf={'start'}><Text fontWeight={'bold'}>{`Total Daily Dex Buybacks: ${dashboardState.data.reduce((acc, data) => acc + data.buyback, 0).toFixed(2)} WHALE`}</Text></HStack>}
  </VStack>
}
