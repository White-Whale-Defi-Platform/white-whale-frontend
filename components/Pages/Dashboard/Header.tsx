import React, { useEffect, useMemo, useState } from 'react'

import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { ChainStat, DashboardPieChart } from 'components/Pages/Dashboard/DashboardPieChart'
import { kBg } from 'constants/visualComponentConstants'
import { formatPrice } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { dashboardDataState } from 'state/dashboardDataState'

export type Token = {
  denom: string;
  amount: number;
}
export const Header = ({ dashboardData }) => {
  const dashboardState = useRecoilValue(dashboardDataState)
  const [price, setPrice] = useState(0)
  const [marketCap, setMarketCap] = useState(0)

  useEffect(() => {
    setPrice(dashboardState.whalePrice)
  }, [dashboardState.whalePrice])

  useEffect(() => {
    setMarketCap(dashboardState.marketCap)
  }, [dashboardState.marketCap])

  console.log({ dashboardState })
  const totalTvl = useMemo(() => dashboardData.reduce((acc, data) => acc + data.tvl, 0), [dashboardData])
  const totalVolume24h = useMemo(() => dashboardData.reduce((acc, data) => acc + data.volume24h, 0), [dashboardData])

  const width = 265
  const boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.4)'
  return <HStack pt={50} px={0} pb={7} width={'full'} justify={'space-between'}>
    <VStack alignItems={'flex-start'}>
      <Box bg={kBg}
        boxShadow={boxShadow}
        borderRadius="10px"
        px={4}
        pt={3}
        h={90}
        w={width}>
        <Text color="whiteAlpha.600">
          WHALE Price
        </Text>
        <Text fontSize={24}>{`$${price}`}</Text>
      </Box>
      <Box bg={kBg}
        boxShadow={boxShadow}
        borderRadius="10px"
        px={4}
        mt={3}
        pt={3}
        h={90}
        w={width}>
        <Text color="whiteAlpha.600">
          Market Cap
        </Text>
        <Text fontSize={24}>{`$${formatPrice(marketCap)}`}</Text>
      </Box>
    </VStack>
    <VStack alignItems={'flex-start'}>
      <Box bg={kBg}
        boxShadow={boxShadow}
        borderRadius="10px"
        px={4}
        pt={3}
        h={90}
        w={width}>
        <Text color="whiteAlpha.600">
          Total DEX TVL
        </Text>
        <Text fontSize={24}>{`${formatPrice(totalTvl)}`}</Text>
      </Box>
      <Box bg={kBg}
        boxShadow={boxShadow}
        borderRadius="10px"
        px={4}
        pt={3}
        h={90}
        mt={3}
        w={width}>
        <Text color="whiteAlpha.600">
          24h DEX Volume
        </Text>
        <Text fontSize={24}>{`${formatPrice(totalVolume24h)}`}</Text>
      </Box>
    </VStack>
    <Box bg={kBg}
      boxShadow={boxShadow}
      borderRadius="10px"
      px={4}
      pt={3}
      h={200}
      w={340}>
      <Text color="whiteAlpha.600">
        TVL
      </Text>
      <DashboardPieChart dashboardData={dashboardState.data} chainStat={ChainStat.tvl} />
    </Box>
    <Box bg={kBg}
      boxShadow={boxShadow}
      borderRadius="10px"
      px={4}
      pt={3}
      h={200}
      w={340}>
      <Text color="whiteAlpha.600">
        Volume
      </Text>
      <DashboardPieChart dashboardData={dashboardState.data} chainStat={ChainStat.volume24h} />
    </Box>
  </HStack>
}
