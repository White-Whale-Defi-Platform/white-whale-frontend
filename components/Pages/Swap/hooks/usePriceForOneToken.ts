import { useTokenToTokenPrice } from './useTokenToTokenPrice'

export const usePriceForOneToken = ({ tokenASymbol, tokenBSymbol }) => {
  const [currentTokenPrice, isPriceLoading] = useTokenToTokenPrice({
    tokenASymbol,
    tokenBSymbol,
    tokenAmount: 1,
  })

  return [currentTokenPrice, isPriceLoading] as const
}
