import { Box, Button } from '@chakra-ui/react'
import { useClosePosition } from 'components/Pages/Trade/Liquidity/hooks/useClosePosition'
import { useWithdrawPosition } from 'components/Pages/Trade/Liquidity/hooks/useWithdrawPosition'
import { PositionState } from 'constants/state'

export const Action = ({ item, poolId }) => {
  const close = useClosePosition({ poolId })
  const withdraw = useWithdrawPosition({ poolId })

  if (item?.state === PositionState.active) {
    return (
      <Button
        width="full"
        variant="outline"
        size="sm"
        borderColor="whiteAlpha.700"
        isLoading={close?.isLoading}
        onClick={() => close?.submit({ unbonding_duration: item?.unbonding_duration })
        }
      >
        Close
      </Button>
    )
  } else if (item?.state === PositionState.unbonding) {
    return (
      <Button width="full" variant="outline" size="sm" isDisabled={true}>
        Unbonding
      </Button>
    )
  } else if (item?.state === PositionState.withdraw || item?.state === PositionState.unbonded) {
    return (
      <Button
        width="full"
        variant="primary"
        size="sm"
        isLoading={withdraw?.isLoading}
        onClick={() => withdraw?.submit()}
      >
        Unlock LP
      </Button>
    )
  }
  return <Box w="full" />
}
