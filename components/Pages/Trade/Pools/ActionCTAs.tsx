import { Button, HStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'

export const ActionCTAs = ({ chainIdParam, chainId, pool }) => {
  const router = useRouter()

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
    <HStack spacing={2} ml={-2}>
      <Button
        variant="outline"
        borderColor="whiteAlpha.700"
        size="sm"
        onClick={onManageLiquidityClick}>
        {' '}
        Manage
      </Button>
      <Button
        variant="outline"
        borderColor="whiteAlpha.700"
        size="sm"
        onClick={onIncentivizeClick}
        isDisabled={!pool?.staking_address}
      >
        {' '}
        Incentivize
      </Button>
    </HStack>
  )
}
