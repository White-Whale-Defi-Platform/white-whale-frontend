import { useMemo } from 'react'

import { Button, HStack } from '@chakra-ui/react'
import { INCENTIVE_ENABLED_CHAIN_IDS } from 'constants/bonding_contract'
import { useRouter } from 'next/router'

export const ActionCTAs = ({ chainIdParam, chainId, pool }) => {
  const router = useRouter()
  const isIncentivized = useMemo(
    () => INCENTIVE_ENABLED_CHAIN_IDS.includes(chainId),
    [chainId]
  )

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
        Manage
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
