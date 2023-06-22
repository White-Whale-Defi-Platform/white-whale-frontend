import { Box, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { Action } from './Action'
import useLockedPositions from 'components/Pages/Liquidity/hooks/useLockedPositions'
import useRewards from './hooks/useRewards'
import { Positions } from './Positions'
import { Rewards } from './Rewards'

type Props = {
  poolId: string
  dailyEmissions: any
}

const Overview = ({ poolId, dailyEmissions }: Props) => {
  const { rewards, totalValue } = useRewards(poolId)
  const { data: positionData = [] } = useLockedPositions(poolId)
  const positions = useMemo(() => {
    return positionData?.map((item) => ({
      ...item,
      action: <Action item={item} poolId={poolId} />,
    }))
  }, [positionData])

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
