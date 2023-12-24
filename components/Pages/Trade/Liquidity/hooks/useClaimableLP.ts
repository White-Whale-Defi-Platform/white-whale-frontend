import { useMemo } from 'react'

import useLockedPositions from 'components/Pages/Trade/Liquidity/hooks/useLockedPositions'
import { PositionState } from 'constants/state'

const useClaimableLP = ({ poolId }) => {
  const { data: positions = [] } = useLockedPositions(poolId)
  // Filter out positions that are not open and are not unbonded and add total of amount
  return useMemo(() => positions?.filter((p) => !p.isOpen && p.state === PositionState.unbonded).
    reduce((acc, p) => acc + Number(p.amount), 0)
  , [positions])
}

export default useClaimableLP
