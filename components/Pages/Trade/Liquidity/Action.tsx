import { Box, Button } from '@chakra-ui/react'

import { useClosePosition } from 'components/Pages/Trade/Liquidity/hooks/useClosePosition'
import { useWithdrawPosition } from 'components/Pages/Trade/Liquidity/hooks/useWithdrawPosition'
import { STATE } from 'components/Pages/Trade/Liquidity/Positions'

export const Action = ({ item, poolId }) => {
  const close = useClosePosition({ poolId })
  const withdraw = useWithdrawPosition({ poolId })

  if (item?.state === STATE.ACTIVE) {
    return (
      <Button
        width="full"
        variant="outline"
        size="sm"
        isLoading={close?.isLoading}
        onClick={() => close?.submit({ unbonding_duration: item?.unbonding_duration })
        }
      >
        Close
      </Button>
    )
  } else if (item?.state === STATE.UNBONDING) {
    return (
      <Button width="full" variant="outline" size="sm" isDisabled={true}>
        Unbonding
      </Button>
    )
  } else if (item?.state === STATE.UNBONDED) {
    return (
      <Button
        width="full"
        variant="outline"
        size="sm"
        isLoading={withdraw?.isLoading}
        onClick={() => withdraw?.submit()}
      >
        Unbound
      </Button>
    )
  } else if (item?.state === STATE.WITHDRAW) {
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
  <Box w="full" />
}
