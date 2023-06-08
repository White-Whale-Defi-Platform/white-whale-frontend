import { useMemo } from 'react'
import { NUMBER_OF_SECONDS_IN_DAY } from 'constants'
import usePositions from '../../Liquidity/hooks/usePositions'

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
