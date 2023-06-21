import fetch from 'isomorphic-unfetch'
import { POOL_INFO_BASE_URL } from 'util/constants'
import { formatPrice } from 'libs/num'

import terraPoolConfig from 'public/mainnet/phoenix-1/pools_list.json'

export interface EnigmaPoolResponse {
  pool_id: string
  chain_name: string
  displayName: string
  displayLogo1: string
  displayLogo2: string
  volume_24h: number | string
  volume_7d: number | string
  TVL: number | string
  Price: string
  APR: number | string
}

export interface EnigmaPoolData {
  pool_id: string
  usdVolume24h?: number | string
  usdVolume7d?: number | string
  apr7d?: number | string
  TVL?: number | string
  ratio?: number | string
}

export const getPairInfos = async (
  chain: string
): Promise<EnigmaPoolResponse[]> => {
  if (!chain) return []
  chain = chain === 'inj' ? 'injective' : chain
  const url = `/api/cors?url=${POOL_INFO_BASE_URL}/${chain}/all/current`

  let chainDataResponse = await fetch(url)
  // sometimes throws 400 error for unknown reason
  while (chainDataResponse.status === 400) {
    console.log('Retrying...')
    chainDataResponse = await fetch(url)
  }
  const data = await chainDataResponse.text()
  if (chainDataResponse.status === 200 && data !== 'chain unknown' && data) {
    return JSON.parse(data)
  } else {
    return []
  }
}
export const getPairInfosTerra = async (): Promise<any> => {
  const swapAddresses = terraPoolConfig.pools
    .map((pool: any) => pool.swap_address)
    .join(',')
  const url = `/api/cors?url=https://api.coinhall.org/api/v1/pairs?addresses=${swapAddresses}`
  let chainDataResponse = await fetch(url)

  const data = await chainDataResponse.text()
  if (chainDataResponse.status === 200 && data) {
    return JSON.parse(data)
  } else {
    return []
  }
}
export const getPairAprAndDailyVolume = async (
  pools: any[],
  chain: any
): Promise<EnigmaPoolData[]> => {
  const poolIds = pools?.map((pool: any) => pool.pool_id)

  const pairInfos: EnigmaPoolResponse[] = await getPairInfos(chain)

  if (pairInfos.length > 0) {
    return poolIds?.map((poolId: string) => {
      const pairInfo = pairInfos.find((row: any) => row.pool_id === poolId)
      return {
        pool_id: poolId,
        usdVolume24h: `$${formatPrice(pairInfo?.volume_24h)}`,
        usdVolume7d: `$${formatPrice(pairInfo?.volume_7d)}`,
        TVL: `$${formatPrice(pairInfo?.TVL)}`,
        apr7d: `${Number(pairInfo?.APR).toFixed(2)}%`,
        ratio: `${Number(pairInfo?.Price).toFixed(3)}`,
      } as EnigmaPoolData
    })
  } else {
    console.log('No pair infos found')
    return poolIds?.map((poolId: any) => {
      return {
        pool_id: poolId,
        TVL: 'n/a',
        usdVolume24h: 'n/a',
        usdVolume7d: 'n/a',
        apr7d: 'n/a',
        ratio: 'n/a',
      }
    })
  }
}
export const getPairAprAndDailyVolumeTerra = async (
  pools: any[]
): Promise<EnigmaPoolData[]> => {
  const swapAddresses = pools?.map((pool: any) => pool.swap_address)
  const pairInfos: any = await getPairInfosTerra()

  if (!!pairInfos && pairInfos.pairs.length > 0 && !!pools) {
    return swapAddresses?.map((swapAddress: string) => {
      const pairInfo = pairInfos.pairs.find(
        (row: any) => row.pairAddress === swapAddress
      )
      const poolId = terraPoolConfig.pools.find(
        (pool: any) => pool.swap_address === swapAddress
      )?.pool_id
      const asset0Symbol = poolId?.split('-')[0]
      const chRatio =
        pairInfo?.asset0.symbol === asset0Symbol
          ? pairInfo?.asset0.usdPrice / pairInfo?.asset1.usdPrice
          : pairInfo?.asset1.usdPrice / pairInfo?.asset0.usdPrice

      const pool = pools.find((pool: any) => pool.swap_address === swapAddress)
      const displayAssetOrder = pool.displayName?.split('-')
      const totalPoolLiquidity = pool.liquidity.reserves.total
      const asset0Balance =
        totalPoolLiquidity[0] / 10 ** pool.pool_assets[0].decimals
      const asset1Balance =
        totalPoolLiquidity[1] / 10 ** pool.pool_assets[1].decimals

      let poolRatio = asset1Balance === 0 ? 0 : asset0Balance / asset1Balance
      if (displayAssetOrder?.[0] === pool.assetOrder?.[0]) {
        poolRatio = asset0Balance === 0 ? 0 : asset1Balance / asset0Balance
      }
      const ratio = poolId?.includes('axlUSDC') ? chRatio : poolRatio
      return {
        pool_id: poolId,
        usdVolume24h: `$${formatPrice(pairInfo?.usdVolume24h)}`,
        usdVolume7d: `$${formatPrice(pairInfo?.usdVolume7d)}`,
        totalLiquidity: Number(pairInfo?.usdLiquidity),
        TVL: `$${formatPrice(pairInfo?.usdLiquidity)}`,
        apr7d: `${Number(pairInfo?.apr7d).toFixed(2)}%`,
        ratio: `${ratio.toFixed(3)}`,
      } as EnigmaPoolData
    })
  } else {
    console.log('No pair infos found')
    return swapAddresses?.map((swapAddress: any) => {
      const poolId = terraPoolConfig.pools.find(
        (pool: any) => pool.swap_address === swapAddress
      ).pool_id
      return {
        pool_id: poolId,
        TVL: 'n/a',
        usdVolume24h: 'n/a',
        usdVolume7d: 'n/a',
        apr7d: 'n/a',
        ratio: 'n/a',
      }
    })
  }
}
