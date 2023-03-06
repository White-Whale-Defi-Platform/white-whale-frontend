/*
 * takes base token price, fetches the ratio of the token provided vs the base token
 * and calculates the dollar value of the provided token
 * */
import { useCosmwasmClient } from 'hooks/useCosmwasmClient'
import { useRecoilValue } from 'recoil'

import { useTokenDollarValue } from '../hooks/useTokenDollarValue'
import { useBaseTokenInfo } from '../hooks/useTokenInfo'
import { walletState } from '../state/atoms/walletAtoms'
import { tokenToTokenPriceQueryWithPools } from './tokenToTokenPriceQuery'
import { useGetQueryMatchingPoolForSwap } from './useQueryMatchingPoolForSwap'

export const useGetTokenDollarValueQuery = () => {
  const baseToken = useBaseTokenInfo()
  const { chainId, client } = useRecoilValue(walletState)
  // const client = useCosmwasmClient(chainId)

  const [tokenADollarPrice, fetchingDollarPrice] = useTokenDollarValue(
    baseToken?.symbol
  )

  const [getMatchingPoolForSwap, isLoadingPoolForSwapMatcher] =
    useGetQueryMatchingPoolForSwap()

  return [
    async function getTokenDollarValue({ tokenA, tokenB=baseToken, tokenAmountInDenom }) {
      if (!tokenAmountInDenom) return 0

      const priceForOneToken = await tokenToTokenPriceQueryWithPools({
        matchingPools: getMatchingPoolForSwap({ tokenA, tokenB }),
        tokenA,
        tokenB,
        client,
        amount: 1,
        id: tokenA?.id,
      })

      if (tokenA?.id === tokenB?.id && !!tokenA?.id)
        return (tokenAmountInDenom / priceForOneToken) * tokenADollarPrice
      else return priceForOneToken
    },
    Boolean(
      baseToken && client && !fetchingDollarPrice && !isLoadingPoolForSwapMatcher
    ),
  ] as const
}
