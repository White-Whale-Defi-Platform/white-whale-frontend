import { useMemo } from 'react'

import { HStack, Text } from '@chakra-ui/react'
import { formatPrice } from 'libs/num'

export const Header = ({ dashboardData }) => {
  const totalTvl = useMemo(() => dashboardData.reduce((acc, data) => acc + data.tvl, 0), [dashboardData])
  const totalVolume24h = useMemo(() => dashboardData.reduce((acc, data) => acc + data.volume24h, 0), [dashboardData])
  return <HStack pt={50} pb={7} width={'full'} justify={'space-between'}>
    <Text fontSize={24} fontWeight={'bold'}>{`Total Dex TVL: $${(formatPrice(totalTvl))}`}</Text>
    <Text fontSize={24} fontWeight={'bold'}>{`Total 24h Dex Volume: $${(formatPrice(totalVolume24h))}`}</Text>
  </HStack>
}
