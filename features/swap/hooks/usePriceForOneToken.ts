import { usePersistance } from 'junoblocks'

import { useTokenToTokenPrice } from './useTokenToTokenPrice'

export const usePriceForOneToken = ({ tokenASymbol, tokenBSymbol }) => {
  const [currentTokenPrice, isPriceLoading] = useTokenToTokenPrice({
    tokenASymbol: tokenASymbol,
    tokenBSymbol: tokenBSymbol,
    tokenAmount: 1,
  })

  // const persistPrice = usePersistance(
  //   isPriceLoading ? undefined : currentTokenPrice
  // )

  return [currentTokenPrice, isPriceLoading] as const
}
