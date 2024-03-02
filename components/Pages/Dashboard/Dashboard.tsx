import React, { FC, useEffect } from 'react'

import { VStack } from '@chakra-ui/react'
import Loader from 'components/Loader'
import { Header } from 'components/Pages/Dashboard/Header'
import { useGetBondingAprs } from 'components/Pages/Dashboard/hooks/useGetBondingAprs'
import { StatsTable } from 'components/Pages/Dashboard/StatsTable'
import { useFetchCirculatingSupply } from 'hooks/useFetchCirculatingSupply'
import { usePrices } from 'hooks/usePrices'
import { useRecoilState } from 'recoil'
import { dashboardDataState } from 'state/dashboardDataState'
import { getChainLogoUrlByName } from 'util/getChainLogoUrlByName'
import { getDashboardData } from 'util/getDashboardData'
import { getBondingAPRsAPI } from '../../../services/useAPI'

export type DashboardData = {
  logoUrl: string
  chainName: string
  tvl: number
  volume24h: number
  apr: number
}
export const Dashboard: FC = () => {
  const [dashboardState, setDashboardDataState] = useRecoilState(dashboardDataState)
  const prices = usePrices()
  const circulatingWhaleSupply: number = useFetchCirculatingSupply()

  useEffect(() => {
    const fetchDashboardData = async () => {
      const mockData = await getDashboardData()
      const aprs = await getBondingAPRsAPI()
      const mappedDashboardData = mockData.map((data) => {
        const apr = aprs[data.chainName].bondingAPR
        return ({
          logoUrl: getChainLogoUrlByName(data.chainName),
          chainName: data.chainName,
          tvl: data.tvl,
          volume24h: data.volume24h,
          apr: apr ? apr : 0,
        } as DashboardData)
      })

      setDashboardDataState({ ...dashboardState,
        data: mappedDashboardData,
        isInitialized: true,
      })
    }
    if (!dashboardState.isInitialized) {
      fetchDashboardData()
    }
  }, [dashboardState.isInitialized])

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
  </VStack>
}
