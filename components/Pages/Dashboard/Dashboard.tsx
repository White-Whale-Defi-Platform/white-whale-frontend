import React, { FC, useEffect } from 'react'
import { HStack, Text, VStack } from '@chakra-ui/react'
import Loader from 'components/Loader'
import { Header } from 'components/Pages/Dashboard/Header'
import { StatsTable } from 'components/Pages/Dashboard/StatsTable'
import { usePrices } from 'hooks/usePrices'
import { fetchSupply } from 'libs/fetchSupply'
import { useRecoilState } from 'recoil'
import { getBondingAPRsAPI } from 'services/useAPI'
import { dashboardDataState } from 'state/dashboardDataState'
import { getChainLogoUrlByName } from 'util/getChainLogoUrlByName'
import { getDashboardData } from 'util/getDashboardData'
  import { useGetDailyBuybacks } from './hooks/useGetDailyBuybacks'

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
  const { data: buybackData, isLoading } = useGetDailyBuybacks()
  const prices = usePrices()
  useEffect(() => {
    const fetchDashboardData = async () => {
      let [circulatingWhaleSupply, mockData, aprs]: any = await Promise.all([
        fetchSupply(),
        getDashboardData(),
        getBondingAPRsAPI(),
      ])
      circulatingWhaleSupply = circulatingWhaleSupply?.circulating / (10 ** 6) || 0
      const marketCap = circulatingWhaleSupply * (prices?.WHALE || 0)
      const mappedDashboardData = mockData.map((data) => {
        const apr = aprs[data.chainName].bondingAPR
        const buyback = buybackData.find(buybackData=> buybackData.chainName === data.chainName)?.buyback
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
