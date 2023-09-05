import { useMemo } from 'react'

import { Divider, HStack, Text, VStack } from '@chakra-ui/react'
import { TooltipWithChildren } from 'components/TooltipWithChildren'

import { AvailableRewards } from 'components/Pages/Trade/Liquidity/AvailableRewards'

export const Rewards = ({ rewards = [], totalValue, dailyEmissions = [] }) => {
  const totalUsdValue = useMemo(() => dailyEmissions.reduce((total, item) => total + (isNaN(item.dailyUsdEmission) ? 0 : item.dailyUsdEmission),
    0),
  [dailyEmissions])

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
        <TooltipWithChildren
          label={`$${totalValue}`}
          showTooltip={rewards.length > 0}
        >
          <AvailableRewards data={rewards} />
        </TooltipWithChildren>
      </HStack>

      <Divider />

      <HStack width="full" justifyContent="space-between">
        <Text fontSize="14px" color="whiteAlpha.700">
          Estimated Daily Rewards
        </Text>
        <TooltipWithChildren
          label={`$${totalUsdValue.toFixed(2)}`}
          showTooltip={dailyEmissions.length > 0}
        >
          <AvailableRewards data={dailyEmissions} />
        </TooltipWithChildren>
      </HStack>
    </VStack>
  )
}
