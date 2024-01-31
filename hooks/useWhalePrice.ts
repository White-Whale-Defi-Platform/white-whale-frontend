import { usePrices } from 'hooks/usePrices'

export const useWhalePrice = () => {
  const prices = usePrices()
  return prices?.WHALE || 0
}
