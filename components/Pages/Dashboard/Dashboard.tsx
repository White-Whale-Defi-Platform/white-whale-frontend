import React, { FC, useEffect } from 'react'

import { HStack, Text, VStack } from '@chakra-ui/react'
import Loader from 'components/Loader'
import { Header } from 'components/Pages/Dashboard/Header'
import { StatsTable } from 'components/Pages/Dashboard/StatsTable'
import { WALLET_CHAIN_NAMES_BY_CHAIN_ID } from 'constants/networks'
import { useChainInfos } from 'hooks/useChainInfo'
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
  const { data: dashboardData, isLoading } = useGetDashboardDataAPI()
  const chains = useChainInfos()
  const prices = usePrices()
  useEffect(() => {
    const fetchDashboardData = () => {
      const circulatingWhaleSupply = (dashboardData.supply?.circulating ?? 0) / (10 ** 6)
      const marketCap = circulatingWhaleSupply * (prices?.WHALE || 0) || 0
      const mappedDashboardData = []
      dashboardData.dashboardData?.map((data) => {
        const apr = 0;
        const buyback = (dashboardData?.bondingInfos?.[data.chainName]?.buyback);

        const chain = chains?.find((chain) => WALLET_CHAIN_NAMES_BY_CHAIN_ID[chain.chainId] === data.chainName)
        if (!chain) {
          return
        }
        mappedDashboardData.push({
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
        isInitialized: prices?.WHALE !== 0 && circulatingWhaleSupply !== 0 && marketCap !== 0 && mappedDashboardData?.length > 0 && chains?.length > 0,
      })
    }
    if (!dashboardState.isInitialized) {
      fetchDashboardData()
    }
  }, [prices, dashboardState.isInitialized, isLoading])

  return <VStack width={'full'}>
    {dashboardState.isInitialized && <Header dashboardData={dashboardState?.data} />}
    {!dashboardState.isInitialized && (<HStack
      paddingTop={'20%'}
      width="full"
      alignContent="center"
      justifyContent="center"
      alignItems="center">
      <Loader />
    </HStack>)}
    {dashboardState.isInitialized && <StatsTable dashboardData={dashboardState?.data} />}
    {dashboardState.isInitialized && <HStack alignSelf={'start'}><Text fontWeight={'bold'}>{`Total Daily Dex Buybacks: ${dashboardState.data?.reduce((acc, data) => acc + data?.buyback, 0).toFixed(2)} WHALE`}</Text></HStack>}
  </VStack>
}
