import { POOL_INFO_BASE_URL } from 'constants/index'
import fetch from 'isomorphic-unfetch'
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

export const getPairInfos = async (chain: string): Promise<EnigmaPoolResponse[]> => {
  if (!chain) {
    return []
  }
  chain = chain === 'inj' ? 'injective' : chain
  const url = `/api/cors?url=${POOL_INFO_BASE_URL}/${chain}/all/current`

  async function fetchWithRetry(
    url, retries = 5, interval = 3000,
  ) {
    while (retries) {
      const response = await fetch(url)

      if (response.status !== 400) {
        return response
      }

      console.log('Retrying...')
      await new Promise((resolve) => setTimeout(resolve, interval))
      retries--
    }

    return null
  }

  const chainDataResponse = await fetchWithRetry(url)

  const data = await chainDataResponse?.text()
  if (chainDataResponse?.status === 200 && data !== 'chain unknown' && data) {
    return JSON.parse(data)
  }
  return []
}
export const getPairInfosTerra = async (): Promise<any> => {
  const swapAddresses = terraPoolConfig.pools.
    map((pool: any) => pool.swap_address).
    join(',')
  const url = `/api/cors?url=https://api.seer.coinhall.org/api/coinhall/pools?addresses=${swapAddresses}`
  const chainDataResponse = await fetch(url)
  const data = await chainDataResponse.json()

  if (chainDataResponse.status === 200 && data) {
    return data
  }
  return []
}
export const getPairAprAndDailyVolume = async (pools: any[],
  chainPrefix: any): Promise<EnigmaPoolData[]> => {
  const poolIds = pools?.map((pool: any) => pool.pool_id)

  const pairInfos: EnigmaPoolResponse[] = await getPairInfos(chainPrefix)

  if (pairInfos.length > 0) {
    return poolIds?.map((poolId: string) => {
      const pairInfo = pairInfos.find((row: any) => row.pool_id === poolId)
      return {
        pool_id: poolId,
        usdVolume24h: `$${formatPrice(pairInfo?.volume_24h)}`,
        usdVolume7d: `$${formatPrice(pairInfo?.volume_7d)}`,
        totalLiquidity: Number(pairInfo?.TVL),
        TVL: `$${formatPrice(pairInfo?.TVL)}`,
        apr7d: `${Number(pairInfo?.APR).toFixed(2)}%`,
        ratio: `${Number(pairInfo?.Price).toFixed(3)}`,
      } as EnigmaPoolData
    })
  }
  console.log('No pair infos found')
  return poolIds?.map((poolId: any) => ({
    pool_id: poolId,
    TVL: 'n/a',
    usdVolume24h: 'n/a',
    usdVolume7d: 'n/a',
    apr7d: 'n/a',
    ratio: 'n/a',
  }))
}
export const getPairAprAndDailyVolumeTerra = async (pools: any[]): Promise<EnigmaPoolData[]> => {
  const swapAddresses = pools?.map((pool: any) => pool.swap_address)
  const pairInfos: any = await getPairInfosTerra()

  if (pairInfos && pairInfos.pools?.length > 0 && pools) {
    return swapAddresses?.map((swapAddress: string) => {
      const pairInfo = pairInfos.pools.find((row: any) => row.id === swapAddress)
      const poolId = terraPoolConfig.pools.find((pool: any) => pool.swap_address === swapAddress)?.pool_id
      const asset0Symbol = poolId?.split('-')[0]
      const chRatio =
        pairInfo?.assets[0].symbol === asset0Symbol
          ? pairInfo?.assets[0].usdPrice / pairInfo?.assets[1].usdPrice
          : pairInfo?.assets[1].usdPrice / pairInfo?.assets[0].usdPrice

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
        usdVolume24h: `$${formatPrice(pairInfo?.volume24h)}`,
        usdVolume7d: `$${formatPrice(pairInfo?.volume7d)}`,
        totalLiquidity: Number(pairInfo?.liquidity),
        TVL: `$${formatPrice(pairInfo?.liquidity)}`,
        apr7d: `${Number(pairInfo?.apr7d).toFixed(2)}%`,
        ratio: `${ratio.toFixed(3)}`,
      } as EnigmaPoolData
    })
  }
  console.log('No pair infos found')
  return swapAddresses?.map((swapAddress: any) => {
    const poolId = terraPoolConfig.pools.find((pool: any) => pool.swap_address === swapAddress).pool_id
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
