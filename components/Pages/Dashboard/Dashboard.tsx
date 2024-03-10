import React, { FC, useEffect } from 'react'

import { HStack, VStack } from '@chakra-ui/react'
import Loader from 'components/Loader'
import { Header } from 'components/Pages/Dashboard/Header'
import { StatsTable } from 'components/Pages/Dashboard/StatsTable'
import { usePrices } from 'hooks/usePrices'
import { useRecoilState } from 'recoil'
import { dashboardDataState } from 'state/dashboardDataState'
import { getChainLogoUrlByName } from 'util/getChainLogoUrlByName'
import { getDashboardData } from 'util/getDashboardData'
import { getBondingAPRsAPI } from 'services/useAPI'
import { fetchSupply } from 'libs/fetchSupply'

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
  useEffect(() => {
    const fetchDashboardData = async () => {
      let [circulatingWhaleSupply, mockData, aprs]: any = await Promise.all([
        fetchSupply(),
        getDashboardData(),
        getBondingAPRsAPI(),
      ]);
      circulatingWhaleSupply = circulatingWhaleSupply?.circulating / (10 ** 6) || 0
      const marketCap = circulatingWhaleSupply * (prices?.WHALE || 0)
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
  }, [prices, dashboardState.isInitialized])

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
  </VStack>
}
