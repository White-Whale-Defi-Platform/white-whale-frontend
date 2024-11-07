import { AllPoolData } from 'components/Pages/Trade/Pools/Pools'

export const calculateMyPosition = (pool: AllPoolData) => {
  const { dollarValue } = pool.liquidity?.providedTotal || {}
  return dollarValue.toFixed(2)
}
