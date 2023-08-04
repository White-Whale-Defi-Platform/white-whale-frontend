import { useMemo } from 'react'

import useLockedPositions from 'components/Pages/Liquidity/hooks/useLockedPositions'
import { SECONDS_PER_DAY } from 'constants'

const useIsNewPosition = ({ bondingDays, poolId }) => {
  const { data: positions = [] } = useLockedPositions(poolId)

  return useMemo(() => {
    const match: any[] = positions?.filter(
      (p) => p?.unbonding_duration === bondingDays * SECONDS_PER_DAY
    )

    return match.length === 0
  }, [positions, bondingDays, poolId])
}

export default useIsNewPosition
