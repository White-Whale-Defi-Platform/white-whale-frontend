/*
 * Takes base token price, fetches the ratio of the token provided vs the base token
 * and calculates the dollar value of the provided token
 *
 */
import { useCallback } from 'react'

import { useClients } from 'hooks/useClients'
import { useTokenDollarValue } from 'hooks/useTokenDollarValue'
import { useBaseTokenInfo } from 'hooks/useTokenInfo'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import { tokenToTokenPriceQueryWithPools } from './tokenToTokenPriceQuery'
import { useGetQueryMatchingPoolForSwap } from './useQueryMatchingPoolForSwap'

export const useGetTokenDollarValueQuery = () => {
  const baseToken = useBaseTokenInfo()
  const { chainName } = useRecoilValue(chainState)
  const { cosmWasmClient } = useClients(chainName)

  const [tokenADollarPrice, fetchingDollarPrice] = useTokenDollarValue(baseToken?.symbol)

  const [getMatchingPoolForSwap, isLoadingPoolForSwapMatcher] =
    useGetQueryMatchingPoolForSwap()

  const getTokenDollarValue = useCallback(async ({ tokenA, tokenB = baseToken, tokenAmountInDenom }) => {
    if (!tokenAmountInDenom) {
      return 0
    }
    const priceForOneToken = await tokenToTokenPriceQueryWithPools({
      matchingPools: getMatchingPoolForSwap({ tokenA,
        tokenB }),
      tokenA,
      tokenB,
      cosmWasmClient,
      amount: 1,
      id: tokenA?.id,
    })

    if (tokenA?.id === tokenB?.id && tokenA?.id) {
      return (tokenAmountInDenom / priceForOneToken) * tokenADollarPrice
    }
    return priceForOneToken
  },
  [
    tokenADollarPrice,
    cosmWasmClient,
    getMatchingPoolForSwap,
    fetchingDollarPrice,
  ])

  return [
    getTokenDollarValue,
    Boolean(baseToken &&
        cosmWasmClient &&
        !fetchingDollarPrice &&
        !isLoadingPoolForSwapMatcher),
  ] as const
}
