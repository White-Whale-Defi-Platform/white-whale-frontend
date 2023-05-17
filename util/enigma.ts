import fetch from 'isomorphic-unfetch'
import { POOL_INFO_BASE_URL } from 'util/constants'

export interface EnigmaPoolResponse {
  pool_id: string
  chain_name: string
  displayName: string
  displayLogo1: string
  displayLogo2: string
  volume_24h: number
  volume_7d: number
  TVL: number
  Price: string
  APR: number
}

export interface EnigmaPoolData {
  pool_id: string
  usdVolume24h: number
  usdVolume7d: number
  apr7d: number
  TVL: number
  ratio: number
}

export const getPairInfos = async (
  chain: string
): Promise<EnigmaPoolResponse[]> => {
  if (chain === null || chain === undefined) return []
  if (chain === 'inj') chain = 'injective'
  const chainDataResponse = await fetch(
    `${POOL_INFO_BASE_URL}/${chain}/all/current`
  )
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
  const poolIds = pools.map((pool: any) => pool.pool_id)

  const pairInfos: EnigmaPoolResponse[] = await getPairInfos(chain)

  if (pairInfos.length > 0) {
    return poolIds.map((poolId: string) => {
      const pairInfo = pairInfos.find((row: any) => row.pool_id === poolId)
      return {
        pool_id: poolId,
        usdVolume24h: pairInfo?.volume_24h || 0,
        usdVolume7d: pairInfo?.volume_7d || 0,
        TVL: pairInfo?.TVL || 0,
        apr7d: pairInfo?.APR || 0,
        ratio: pairInfo?.Price || 0,
      } as EnigmaPoolData
    })
  } else {
    return poolIds.map((poolId: any) => {
      return {
        pool_id: poolId,
        TVL: 0,
        usdVolume24h: 0,
        usdVolume7d: 0,
        apr7d: 0,
        ratio: 0,
      }
    })
  }
}
