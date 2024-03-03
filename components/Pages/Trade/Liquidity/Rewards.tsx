import { useMemo } from 'react'

import { Divider, HStack, Text, VStack } from '@chakra-ui/react'
import { useConnect } from '@quirks/react'
import { AvailableRewards } from 'components/Pages/Trade/Liquidity/AvailableRewards'
import { RewardToolTip } from 'components/RewardToolTip'

export const Rewards = ({ rewards = [], totalValue, dailyEmissions = [] }) => {
  const totalUsdValue = useMemo(() => dailyEmissions.reduce((total, item) => total + (isNaN(item.dailyUsdEmission) ? 0 : item.dailyUsdEmission),
    0),
  [dailyEmissions])

  const { connected } = useConnect()

  return (
    <VStack
      alignItems="flex-start"
      p="20px"
      border="1px solid rgba(255, 255, 255, 0.1)"
      filter="drop-shadow(0px 0px 50px rgba(0, 0, 0, 0.25))"
      borderRadius="15px"
      width="full"
    >
      <HStack width="full" justifyContent="space-between">
        <Text fontSize="14px" color="whiteAlpha.700">
          Available Rewards
        </Text>
        <RewardToolTip
          label={`$${totalValue}`}
          showTooltip={rewards.length > 0}
          isWalletConnected={connected}
        >
          <AvailableRewards data={rewards} />
        </RewardToolTip>
      </HStack>

      <Divider />

      <HStack width="full" justifyContent="space-between">
        <Text fontSize="14px" color="whiteAlpha.700">
          Estimated Daily Rewards
        </Text>
        <RewardToolTip
          label={`$${totalUsdValue.toFixed(2)}`}
          showTooltip={dailyEmissions.length > 0}
          isWalletConnected={connected}
        >
          <AvailableRewards data={dailyEmissions} />
        </RewardToolTip>
      </HStack>
    </VStack>
  )
}
