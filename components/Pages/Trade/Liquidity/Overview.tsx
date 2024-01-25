import { useMemo } from 'react'

import { Box, Text, VStack } from '@chakra-ui/react'
import { Action } from 'components/Pages/Trade/Liquidity/Action'
import useLockedPositions from 'components/Pages/Trade/Liquidity/hooks/useLockedPositions'
import useRewards from 'components/Pages/Trade/Liquidity/hooks/useRewards'
import { Positions } from 'components/Pages/Trade/Liquidity/Positions'
import { Rewards } from 'components/Pages/Trade/Liquidity/Rewards'

type Props = {
  poolId: string
  dailyEmissions: any
}

const Overview = ({ poolId, dailyEmissions }: Props) => {
  const { rewards, totalValue } = useRewards(poolId)
  const { data: positionData = [] } = useLockedPositions(poolId)
  const positions = useMemo(() => positionData?.map((item) => ({
    ...item,
    action: <Action item={item} poolId={poolId} />,
  })),
  [positionData])

  return (
    <VStack alignItems="flex-start" gap="16px" py={5}>
      <Rewards
        rewards={rewards}
        totalValue={totalValue}
        dailyEmissions={dailyEmissions}
      />

      {positions.length > 0 ? (
        <Box backgroundColor="#151515" width="full" borderRadius="15px">
          <Positions positions={positions} />
        </Box>
      ) : (
        <Box width="full" textAlign="center">
          <Text color="whiteAlpha.700">No open positions</Text>
        </Box>
      )}
    </VStack>
  )
}
export default Overview
