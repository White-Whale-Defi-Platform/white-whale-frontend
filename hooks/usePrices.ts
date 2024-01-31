import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { getPoolInfo } from 'components/Pages/Trade/Pools/hooks/queryPoolInfo'
import { PoolEntityType, TokenInfo, usePoolsListQuery } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { useClients } from 'hooks/useClients'
import useCoinGecko from 'hooks/useCoinGecko'
import { useTokenList } from 'hooks/useTokenList'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { convertMicroDenomToDenom } from 'util/conversion/index'

type Params = {
  token: TokenInfo
  poolList: PoolEntityType[]
  baseToken: TokenInfo
  baseTokenPrice: number
  cosmWasmClient: any
}
type PriceFromPoolParams = {
  pool: PoolEntityType
  baseToken: TokenInfo
  baseTokenPrice: number
  cosmWasmClient: any
}

const getPriceFromPool = async ({ pool, baseToken, baseTokenPrice, cosmWasmClient }: PriceFromPoolParams) => {
  const poolInfo = await getPoolInfo(pool.swap_address, cosmWasmClient)
  const isBaseTokenLast = pool.pool_assets[1].symbol === baseToken.symbol
  const [asset1, asset2] = poolInfo?.assets || []
  const ratioFromPool = convertMicroDenomToDenom(Number(asset2?.amount), pool.pool_assets[1].decimals) / convertMicroDenomToDenom(Number(asset1?.amount), pool.pool_assets[0].decimals)
  const adjustedRatioFromPool = isBaseTokenLast ? ratioFromPool : 1 / ratioFromPool

  return baseTokenPrice * adjustedRatioFromPool
}

const getTokenPrice = async ({
  token,
  poolList,
  baseToken,
  baseTokenPrice,
  cosmWasmClient,
}: Params) => {
  const poolContainingTokenAndBaseToken = poolList.find((pool) => pool.pool_assets.some((poolAsset) => poolAsset.symbol === token.symbol) && pool.pool_assets.some((poolAsset) => poolAsset.symbol === baseToken.symbol))

  if (!poolContainingTokenAndBaseToken) {
    const poolsContainingToken = poolList.filter((pool) => pool.pool_assets.some((poolAsset) => poolAsset.symbol === token.symbol))

    for (const pool of poolsContainingToken) {
      const otherToken = pool.pool_assets.find((poolAsset) => poolAsset.symbol !== token.symbol)

      const poolContainingOtherTokenAndBaseToken = poolList.find((pool) => pool.pool_assets.some((poolAsset) => poolAsset.symbol === otherToken.symbol) &&
        pool.pool_assets.some((poolAsset) => poolAsset.symbol === baseToken.symbol))

      if (poolContainingOtherTokenAndBaseToken) {
        const otherTokenPrice = await getPriceFromPool({
          pool: poolContainingOtherTokenAndBaseToken,
          baseToken,
          baseTokenPrice,
          cosmWasmClient,
        })
        return await getPriceFromPool({
          pool,
          baseToken: otherToken,
          baseTokenPrice: otherTokenPrice,
          cosmWasmClient,
        })
      }
    }
  } else {
    return getPriceFromPool({
      pool: poolContainingTokenAndBaseToken,
      baseToken,
      baseTokenPrice,
      cosmWasmClient,
    })
  }
}

const getPrices = async ({
  baseToken,
  tokens,
  poolList,
  cosmWasmClient,
  coingeckoPrices,
}) => {
  const prices = {}
  const baseTokenPrice = coingeckoPrices[baseToken.id]?.usd

  for (const token of tokens) {
    if (coingeckoPrices[token.id]) {
      prices[token.symbol] = coingeckoPrices[token.id].usd
    } else {
      prices[token.symbol] = await getTokenPrice({
        token,
        poolList,
        baseToken,
        baseTokenPrice,
        cosmWasmClient,
      })
    }
  }
  return prices
}

export const usePrices = () => {
  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { data: poolsList } = usePoolsListQuery()
  const { cosmWasmClient } = useClients(walletChainName)
  const [tokenList] = useTokenList()
  const coingeckoIds = useMemo(() => tokenList?.tokens.map((token) => token.id),
    [tokenList?.tokens])
  const coingeckoPrices = useCoinGecko(coingeckoIds)
  const { data: prices } = useQuery({
    queryKey: ['newPrices', tokenList?.baseToken, chainId],
    queryFn: async () => await getPrices({
      baseToken: tokenList.baseToken,
      tokens: tokenList?.tokens,
      poolList: poolsList?.pools,
      cosmWasmClient,
      coingeckoPrices,
    }),
    enabled:
      Boolean(tokenList) &&
      Boolean(poolsList.pools) &&
      Boolean(cosmWasmClient) &&
      Boolean(coingeckoPrices),
    refetchInterval: 30000,
  })

  return prices
}
