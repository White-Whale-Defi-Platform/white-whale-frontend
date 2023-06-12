import { useMemo } from 'react'
import usePositions from '../../Liquidity/hooks/usePositions'
import { NUMBER_OF_SECONDS_IN_DAY } from 'constants/index'

const useIsNewPosition = ({ bondingDays, poolId }) => {
  const { data: positions = [] } = usePositions(poolId)

  return useMemo(() => {
    const match = positions?.filter((p) => {
      return p?.unbonding_duration === bondingDays * NUMBER_OF_SECONDS_IN_DAY
    })

    return match.length === 0
  }, [positions, bondingDays, poolId])
}

export default useIsNewPosition
