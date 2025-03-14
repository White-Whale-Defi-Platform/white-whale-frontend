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

import { getPoolFromAPI, getPricesFromPoolsAPIbyDenom } from '../services/useAPI'
import { CHAIN_NAMES } from '../constants'

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
  const chainId = await cosmWasmClient.getChainId()
  let poolInfo = await getPoolFromAPI(chainId, pool.swap_address)
  if (!poolInfo) {
    poolInfo = await getPoolInfo(pool.swap_address, cosmWasmClient)
  }
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

  const chainTokenMap = new Map<string, Array<{base_denom: string, denom: string}>>()

  for (const token of tokens) {
    if (!token?.fromRegistry || !token.traces?.length) {
      continue
    }

    const ibcTrace = token.traces.find(
      trace => trace.type === 'ibc' &&
      CHAIN_NAMES.includes(trace.counterparty.chain_name)
    )

    if (!ibcTrace) {
      continue
    }

    const chainName = ibcTrace.counterparty.chain_name
    if (!chainTokenMap.has(chainName)) {
      chainTokenMap.set(chainName, [])
    }

    chainTokenMap.get(chainName)?.push({
      base_denom: ibcTrace.counterparty.base_denom,
      denom: token.denom
    })
  }

  for (const token of tokens) {
    if (token?.fromRegistry) {
      continue
    }
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
    if (!prices[token.symbol]) {
      const poolsContainingToken = poolList.filter((pool) => pool.pool_assets.some((poolAsset) => poolAsset.symbol === token.symbol))
      for (const pool of poolsContainingToken) {
        let newBaseToken = null
        for (const poolAsset of pool.pool_assets) {
          if (poolAsset.id && coingeckoPrices[poolAsset.id]) {
            newBaseToken = poolAsset
            break
          }
        }
        if (newBaseToken) {
          const newBaseTokenPrice = coingeckoPrices[newBaseToken.id].usd
          prices[token.symbol] = await getPriceFromPool({
            pool,
            baseToken: newBaseToken,
            baseTokenPrice: newBaseTokenPrice,
            cosmWasmClient,
          })
          break
        }
      }
    }
  }
  for (const chainName of chainTokenMap.keys()) {
    const tokenPairs = chainTokenMap.get(chainName)
    for (const { base_denom, denom } of tokenPairs) {
      const apiPrice = await getPricesFromPoolsAPIbyDenom(base_denom, chainName)
      if (apiPrice) {
        prices[denom] = apiPrice.price
      }
    }
  }
  console.log('prices', prices)
  return prices
}

export const usePrices = () => {
  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { data: poolsList } = usePoolsListQuery()
  const { cosmWasmClient } = useClients(walletChainName)
  const [tokenList] = useTokenList()
  const coingeckoIds = useMemo(() => tokenList?.tokens.map((token) => {
    if (token.id && !token.fromRegistry) {
      return token.id
    }
  }),
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
