import { useMemo } from 'react'

import useLockedPositions, {PositionState} from 'components/Pages/Trade/Liquidity/hooks/useLockedPositions'

const useClaimableLP = ({ poolId }) => {
  const { data: positions = [] } = useLockedPositions(poolId)
  return useMemo(() =>
    // Filter out positions that are not open and are not unbound and add total of amount
    positions?.
      filter((p) => !p.isOpen && p.state === PositionState.unbonded).
      reduce((acc, p) => acc + Number(p.amount), 0)
  , [positions, poolId])
}

export default useClaimableLP
