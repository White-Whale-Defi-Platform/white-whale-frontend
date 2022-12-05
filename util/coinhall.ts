import fetch from 'isomorphic-unfetch'

const coinhallV1RootUrl = 'https://api.coinhall.org/api/v1'

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

export const getPairApryAnd24HrVolume = async (pairs: string[]) => {
  const pairInfos = await getPairInfos(pairs)

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
      isUSDCPool:
        pairInfo?.asset0.symbol === 'USDC' ||
        pairInfo?.asset0.symbol === 'axlUSDC' ||
        pairInfo?.asset1.symbol === 'USDC' ||
        pairInfo?.asset1.symbol === 'axlUSDC',
    }
  })
}
