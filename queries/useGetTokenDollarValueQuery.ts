/*
 * takes base token price, fetches the ratio of the token provided vs the base token
 * and calculates the dollar value of the provided token
 * */
import { useCosmwasmClient } from 'hooks/useCosmwasmClient'
import { useRecoilValue } from 'recoil'

import { useTokenDollarValue } from 'hooks/useTokenDollarValue'
import { useBaseTokenInfo } from 'hooks/useTokenInfo'
import { walletState } from 'state/atoms/walletAtoms'
import { tokenToTokenPriceQueryWithPools } from './tokenToTokenPriceQuery'
import { useGetQueryMatchingPoolForSwap } from './useQueryMatchingPoolForSwap'
import request, { gql } from 'graphql-request'
import { useCallback, useMemo } from 'react'
import { num } from 'libs/num'
import { useQuery } from 'react-query'

interface PriceData {
  priceInvertedUsd: string
}

interface Content {
  content: PriceData[]
}

interface PriceByTokenList {
  priceByTokenList: Content
}

export const useWhalePrice = () => {
  const GRAPHQL_URL = 'https://tfm-multi-stage.tfm.dev/graphql'

  const query = gql`
    query ($chain: String!, $tokenList: String!) {
      priceByTokenList(chain: $chain, tokenList: $tokenList) {
        content {
          priceInvertedUsd
        }
      }
    }
  `

  const { data } = useQuery(
    'whale-price',
    async (): Promise<PriceByTokenList> => {
      return await request(GRAPHQL_URL, query, {
        chain: 'terra2',
        tokenList:
          'ibc/36A02FFC4E74DF4F64305130C3DFA1B06BEAC775648927AA44467C76A77AB8DB,ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4',
      })
    }
  )

  return useMemo(() => {
    return (
      num(data?.priceByTokenList?.content?.[0]?.priceInvertedUsd).toNumber() ||
      0
    )
  }, [data])
}

export const useGetTokenDollarValueQuery = () => {
  const baseToken = useBaseTokenInfo()
  const { chainId } = useRecoilValue(walletState)
  const cosmwasmClient = useCosmwasmClient(chainId)
  const whalePrice = useWhalePrice()

  const [tokenADollarPrice, fetchingDollarPrice] = useTokenDollarValue(
    baseToken?.symbol
  )

  const [getMatchingPoolForSwap, isLoadingPoolForSwapMatcher] =
    useGetQueryMatchingPoolForSwap()

  const getTokenDollarValue = useCallback(
    async ({ tokenA, tokenB = baseToken, tokenAmountInDenom }) => {
      if (!tokenAmountInDenom) return 0

      const priceForOneToken = await tokenToTokenPriceQueryWithPools({
        matchingPools: getMatchingPoolForSwap({ tokenA, tokenB }),
        tokenA,
        tokenB,
        client: cosmwasmClient,
        amount: 1,
        id: tokenA?.id,
      })

      if (tokenA?.id === tokenB?.id && !!tokenA?.id)
        return (tokenAmountInDenom / priceForOneToken) * tokenADollarPrice
      else return priceForOneToken
    },
    [
      tokenADollarPrice,
      whalePrice,
      cosmwasmClient,
      getMatchingPoolForSwap,
      fetchingDollarPrice,
    ]
  )

  return [
    getTokenDollarValue,
    Boolean(
      baseToken &&
        cosmwasmClient &&
        !fetchingDollarPrice &&
        !isLoadingPoolForSwapMatcher
    ),
  ] as const
}
