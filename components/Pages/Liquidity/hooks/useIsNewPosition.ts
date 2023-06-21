import { useMemo } from 'react'
import useLockedPositions from 'components/Pages/Liquidity/hooks/useLockedPositions'
import { NUMBER_OF_SECONDS_IN_DAY } from 'constants/index'

const useIsNewPosition = ({ bondingDays, poolId }) => {
  const { data: positions = [] } = useLockedPositions(poolId)

  return useMemo(() => {
    const match = positions?.filter((p) => {
      return p?.unbonding_duration === bondingDays * NUMBER_OF_SECONDS_IN_DAY
    })

    return match.length === 0
  }, [positions, bondingDays, poolId])
}

export default useIsNewPosition
