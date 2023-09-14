import { useMemo } from 'react'

import useLockedPositions from 'components/Pages/Trade/Liquidity/hooks/useLockedPositions'
import { SECONDS_PER_DAY } from 'constants/index'

const useIsNewPosition = ({ bondingDays, poolId }) => {
  const { data: positions = [] } = useLockedPositions(poolId)

  return useMemo(() => {
    const match: any[] = positions?.filter((p) => p?.unbonding_duration === bondingDays * SECONDS_PER_DAY)

    return match.length === 0
  }, [positions, bondingDays, poolId])
}

export default useIsNewPosition
