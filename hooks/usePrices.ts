import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { tokenToTokenPriceQueryWithPools } from 'queries/tokenToTokenPriceQuery'
import {
  PoolEntityType,
  TokenInfo,
  usePoolsListQuery,
} from 'queries/usePoolsListQuery'
import {
  PoolMatchForSwap,
  findPoolForSwap,
} from 'queries/useQueryMatchingPoolForSwap'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import asyncForEach from 'util/asyncForEach'

import useCoinGecko from './useCoinGecko'
import { useBaseTokenInfo } from './useTokenInfo'
import { TokenList, useTokenList } from './useTokenList'
import { useClients } from 'hooks/useClients'

export type Prices = {
  [key: string]: {
    usd: number
  }
}

type GetMatchingPoolArgs = {
  token: TokenInfo
  poolsList: PoolEntityType[]
  baseToken: TokenInfo
}

type GetPrices = {
  baseToken: TokenInfo
  tokens: TokenInfo[]
  cosmWasmClient: any
  poolsList: PoolEntityType[]
  coingecko: Prices
}

const getMatchingPool = ({
  token,
  poolsList,
  baseToken,
}: GetMatchingPoolArgs): PoolMatchForSwap => {
  if (!poolsList || !token || !baseToken) {
    return
  }

  return findPoolForSwap({
    baseToken,
    tokenA: token,
    tokenB: baseToken,
    poolsList,
  })
}

const getPrices = async ({
  baseToken,
  tokens,
  cosmWasmClient,
  poolsList,
  coingecko,
}: GetPrices): Promise<Prices> => {
  const prices = {}
  const baseTokenPrice = coingecko?.[baseToken?.id]?.usd || 0

  await asyncForEach(tokens, async (token) => {
    const symbol = token?.symbol

    if (token?.id) {
      prices[symbol] = coingecko?.[token?.id]?.usd || 0
    } else {
      const matchingPools = getMatchingPool({ token,
        poolsList,
        baseToken })

      const { streamlinePoolBA, streamlinePoolAB } = matchingPools

      if (Object.keys(matchingPools)?.length > 0) {
        const value = await tokenToTokenPriceQueryWithPools({
          matchingPools,

          tokenA: streamlinePoolAB ? token : baseToken,
          tokenB: streamlinePoolBA ? token : baseToken,
          cosmWasmClient,
          amount: 1,
        })
        const price = value * baseTokenPrice
        prices[symbol] = price || 0
      }
    }
  })
  return prices
}

const usePrices = () => {
  const { chainId, chainName } = useRecoilValue(chainState)
  const { data: poolsList } = usePoolsListQuery()
  const baseToken = useBaseTokenInfo()
  const [tokensList]: readonly [TokenList, boolean] = useTokenList()
  const coingeckoIds = useMemo(() => tokensList?.tokens.map((token) => token.id),
    [tokensList?.tokens])
  const coingecko = useCoinGecko(coingeckoIds)
  //const client = useCosmwasmClient(chainId)
  const { cosmWasmClient } = useClients(chainName)
  const { data: prices } = useQuery<Promise<Prices>>({
    queryKey: ['prices', baseToken?.symbol, chainId],
    queryFn: async () =>
      getPrices({
        baseToken,
        tokens: tokensList?.tokens,
        cosmWasmClient,
        poolsList: poolsList?.pools,
        coingecko,
      }),

    enabled:
      Boolean(baseToken) &&
      Boolean(tokensList) &&
      Boolean(cosmWasmClient) &&
      Boolean(coingecko),
    refetchInterval: 30000,
  })

  return prices
}

export default usePrices
