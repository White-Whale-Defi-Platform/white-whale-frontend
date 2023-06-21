import {
  PoolEntityType,
  TokenInfo,
  usePoolsListQuery,
} from 'queries/usePoolsListQuery'
import {
  findPoolForSwap,
  PoolMatchForSwap,
} from 'queries/useQueryMatchingPoolForSwap'
import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { useRecoilValue } from 'recoil'
import asyncForEach from 'util/asyncForEach'
import { Wallet } from 'util/wallet-adapters'
import { tokenToTokenPriceQueryWithPools } from 'queries/tokenToTokenPriceQuery'
import { walletState } from 'state/atoms/walletAtoms'
import useCoinGecko from './useCoinGecko'
import { useCosmwasmClient } from './useCosmwasmClient'
import { useBaseTokenInfo } from './useTokenInfo'
import { TokenList, useTokenList } from './useTokenList'

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
  client: any
  poolsList: PoolEntityType[]
  coingecko: Prices
}

const getMatchingPool = ({
  token,
  poolsList,
  baseToken,
}: GetMatchingPoolArgs): PoolMatchForSwap => {
  if (!poolsList || !token || !baseToken) return

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
  client,
  poolsList,
  coingecko,
}: GetPrices): Promise<Prices> => {
  const prices = {}
  const baseTokenPrice = coingecko?.[baseToken?.id]?.usd || 0

  await asyncForEach(tokens, async (token) => {
    const symbol = token?.symbol

    if (token?.id) prices[symbol] = coingecko?.[token?.id]?.usd || 0
    else {
      const matchingPools = getMatchingPool({ token, poolsList, baseToken })

      const { streamlinePoolBA, streamlinePoolAB } = matchingPools

      if (Object.keys(matchingPools)?.length > 0) {
        const value = await tokenToTokenPriceQueryWithPools({
          matchingPools,
          tokenA: !!streamlinePoolAB ? token : baseToken,
          tokenB: !!streamlinePoolBA ? token : baseToken,
          client: client as Wallet,
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
  const { chainId } = useRecoilValue(walletState)
  const { data: poolsList } = usePoolsListQuery()
  const baseToken = useBaseTokenInfo()
  const [tokensList]: readonly [TokenList, boolean] = useTokenList()
  const coingeckoIds = useMemo(
    () => tokensList?.tokens.map((token) => token.id),
    [tokensList?.tokens]
  )
  const coingecko = useCoinGecko(coingeckoIds)
  const client = useCosmwasmClient(chainId)

  const { data: prices } = useQuery<Promise<Prices>>({
    queryKey: ['prices', baseToken?.symbol, chainId],
    queryFn: async () =>
      getPrices({
        baseToken,
        tokens: tokensList?.tokens,
        client,
        poolsList: poolsList?.pools,
        coingecko,
      }),
    enabled: !!baseToken && !!tokensList && !!client && !!coingecko,
    refetchInterval: 30000,
  })

  return prices
}

export default usePrices
