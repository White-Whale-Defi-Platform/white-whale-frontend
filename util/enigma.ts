import { POOL_INFO_BASE_URL } from 'constants/index'
import fetch from 'isomorphic-unfetch'
import { formatPrice } from 'libs/num'

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
  if (!chain) {
    return []
  }
  chain = chain === 'inj' ? 'injective' : chain
  const url = `/api/cors?url=${POOL_INFO_BASE_URL}/${chain}/all/current`

  async function fetchWithRetry(url, retries = 5, interval = 3000) {
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
export const getPairAprAndDailyVolume = async (
  pools: any[],
  chainPrefix: any
): Promise<EnigmaPoolData[]> => {
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
