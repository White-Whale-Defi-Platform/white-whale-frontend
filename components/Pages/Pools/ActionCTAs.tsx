import { Button, HStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'

export const ActionCTAs = ({ chainIdParam, poolId }) => {
  const router = useRouter()

  const onIncentivizeClick = () => {
    router.push({
      pathname: `/${chainIdParam}/pools/incentivize`,
      query: { poolId },
    })
  }

  const onManageLiquidityClick = () => {
    router.push({
      pathname: `/${chainIdParam}/pools/manage_liquidity`,
      query: { poolId },
    })
  }

  return (
    <HStack spacing={2}>
      <Button variant="outline" size="sm" onClick={onManageLiquidityClick}>
        {' '}
        Manage Liquidity
      </Button>
      <Button variant="outline" size="sm" onClick={onIncentivizeClick}>
        {' '}
        Incentivize
      </Button>
    </HStack>
  )
}
