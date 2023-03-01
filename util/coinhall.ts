import fetch from 'isomorphic-unfetch'

const coinhallV1RootUrl = 'https://api.coinhall.org/api/v1'
const supportedCoinhallChains = ['juno-1', 'phoenix-1']

export const getPairInfos = async (pairs: string[]) => {
  if (pairs.length === 0) return []

  const coinhallV1PairUrl = coinhallV1RootUrl + '/pairs?addresses='
  const param = pairs.join(',')

  const res = await fetch(`/api/cors?url=${coinhallV1PairUrl}${param}`)
  const data = await res.text()

  if (res.status === 200) {
    return JSON.parse(data)
  } else {
    return []
  }
}

export const getPairAprAndDailyVolume = async (
  pools: any[],
  chainId: string
) => {
  const pairs = pools.map((pool: any) => pool.swap_address)

  const pairInfos = supportedCoinhallChains.includes(chainId)
    ? await getPairInfos(pairs)
    : []

  if (pairInfos.length > 0) {
    return pairs.map((pair: any) => {
      const pairInfo = pairInfos.find((row: any) => row.pairAddress === pair)
      return {
        pairAddress: pair,
        usdVolume24h: pairInfo?.usdVolume24h || 0,
        usdVolume7d: pairInfo?.usdVolume7d || 0,
        apr24h: pairInfo?.apr24h || 0,
        apr7d: pairInfo?.apr7d || 0,
        asset0Price: pairInfo?.asset0.usdPrice,
        asset1Price: pairInfo?.asset1.usdPrice,
        usdLiquidity: pairInfo?.usdLiquidity,
        isLunaxPool:
          pairInfo?.asset0.symbol.includes('LunaX') ||
          pairInfo?.asset1.symbol.includes('LunaX'),
      }
    })
  } else {
    return pairs.map((pair: any) => {
      return {
        pairAddress: pair,
        usdVolume24h: 0,
        usdVolume7d: 0,
        apr24h: 0,
        apr7d: 0,
        asset0Price: 1,
        asset1Price: 1,
        isUSDPool: false,
        isLunaxPool: false,
      }
    })
  }
}
