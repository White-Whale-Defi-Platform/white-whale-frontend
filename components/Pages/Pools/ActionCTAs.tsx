import { Button, HStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'

export const ActionCTAs = ({ chainIdParam, pool }) => {
  const router = useRouter()

  const isIncentivized = !!pool?.staking_address

  const onIncentivizeClick = () => {
    router.push({
      pathname: `/${chainIdParam}/pools/incentivize`,
      query: { poolId: pool?.pool_id },
    })
  }

  const onManageLiquidityClick = () => {
    router.push({
      pathname: `/${chainIdParam}/pools/manage_liquidity`,
      query: { poolId: pool?.pool_id },
    })
  }

  return (
    <HStack spacing={2}>
      <Button variant="outline" size="sm" onClick={onManageLiquidityClick}>
        {' '}
        Manage Liquidity
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onIncentivizeClick}
        isDisabled={!isIncentivized}
      >
        {' '}
        Incentivize
      </Button>
    </HStack>
  )
}
