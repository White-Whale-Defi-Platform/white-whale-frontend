import { useMemo } from 'react'

import { Button, HStack } from '@chakra-ui/react'
import { ACTIVE_INCENTIVE_NETWORKS } from 'constants/index'
import { useRouter } from 'next/router'

export const ActionCTAs = ({ chainIdParam, chainId, pool }) => {
  const router = useRouter()
  const isIncentivized = useMemo(() => ACTIVE_INCENTIVE_NETWORKS.includes(chainId),
    [chainId])

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
        isDisabled={!isIncentivized}
      >
        {' '}
        Incentivize
      </Button>
    </HStack>
  )
}
