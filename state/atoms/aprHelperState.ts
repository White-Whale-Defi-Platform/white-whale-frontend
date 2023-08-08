import { SetterOrUpdater, atom } from 'recoil'

type PoolAPR = {
  poolId: string
  fees: number
  incentives: number
}

type APRHelperState = PoolAPR[]

// Inside aprState.js
export const aprHelperState = atom<APRHelperState>({
  key: 'aprHelperState',
  default: [],
})

// Custom hook to access and update the APR state
export function updateAPRHelperState(
  poolId: string,
  feeAsString: string,
  incentives: number,
  setAPRs: SetterOrUpdater<APRHelperState>
) {
  // Helper function to update the APR for a specific pool
  const fees = Number(feeAsString?.replace('%', '')) / 100
  setAPRs((prevAPR) => {
    const updatedAPR = prevAPR?.map((item) => {
      if (item.poolId === poolId) {
        return { ...item, fees, incentives }
      }
      return item
    })
    if (!updatedAPR) {
      return []
    }

    const existingPool = updatedAPR.find((item) => item.poolId === poolId)
    if (!existingPool) {
      updatedAPR.push({ poolId, fees, incentives })
    }

    return updatedAPR
  })
}
