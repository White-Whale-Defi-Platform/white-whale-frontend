import fetch from 'isomorphic-unfetch'
import { POOL_INFO_BASE_URL } from 'util/constants'
import { formatPrice } from 'libs/num'

export interface EnigmaPoolResponse {
  pool_id: string
  chain_name: string
  displayName: string
  displayLogo1: string
  displayLogo2: string
  volume_24h: number | string
  volume_7d: number  | string
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
        usdVolume24h:`$${formatPrice(pairInfo?.volume_24h)}`,
        usdVolume7d: `$${formatPrice(pairInfo?.volume_7d)}` ,
        TVL:`$${formatPrice(pairInfo?.TVL)}`,
        apr7d: `${Number(pairInfo?.APR).toFixed(2)}%`,
        ratio:`${Number(pairInfo?.Price).toFixed(3)}`
      } as EnigmaPoolData
    })
  } else {
    console.log('No pair infos found')
    return poolIds.map((poolId: any) => {
      return {
        pool_id: poolId,
        TVL: "N/A",
        usdVolume24h: "N/A",
        usdVolume7d: "N/A",
        apr7d: "N/A",
        ratio: "N/A",
      }
    })
  }
}
