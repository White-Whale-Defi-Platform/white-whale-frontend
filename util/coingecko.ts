import axios from 'axios'
import moment from 'moment'

const coingeckoV3RootUrl = 'https://api.coingecko.com/api/v3/coins'

const addressToTokenCGCId = {
  ujuno: 'juno-network',
  'ibc/107D152BB3176FAEBF4C2A84C5FFDEEA7C7CB4FE1BBDAB710F1FD25BCD055CBF':
    'juno-network',
  'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9':
    'cosmos',
  'ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034':
    'axlusdc',
  juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup: 'loop',
  juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g:
    'junoswap-raw-dao',
  peggy0xdAC17F958D2ee523a2206206994597C13D831ec7: 'tether',
  inj: 'injective-protocol',
  ucmdx: 'comdex',
  ucmst: 'axlusdc',
  'ibc/961FA3E54F5DCCA639F37A7C45F7BBE41815579EF1513B5AFBEFCFEB8F256352':
    'cosmos',
}

export const getTokenCGCId = (address: string) =>
  addressToTokenCGCId[address] || ''

export const getCGCTokenHistoryPriceUrl = (id: string, timestamp: number) => {
  const dateTime = moment(new Date(timestamp - (timestamp % 86400000))).format(
    'DD-MM-YYYY'
  )

  return `${coingeckoV3RootUrl}/${id}/history?date=${dateTime}&localization=false`
}

export const getTokenPrice = async (address: string, timestamp?: number) => {
  const tokenCGCId = getTokenCGCId(address)
  if (tokenCGCId === '' || !timestamp) {
    return 1
  }

  try {
    const cgcUrl = getCGCTokenHistoryPriceUrl(
      tokenCGCId,
      moment(timestamp).valueOf()
    )

    const res = await axios.get(cgcUrl)
    if (res.status === 200) {
      return res.data && res.data.market_data.current_price.usd
    }
    return 1
  } catch {
    return 1
  }
}

export const getToken24hrPrice = async (address: string) => {
  const tokenCGCId = getTokenCGCId(address)
  if (tokenCGCId === '') {
    return 1
  }

  try {
    const cgcUrl = `${coingeckoV3RootUrl}/${tokenCGCId}/market_chart?vs_currency=usd&days=1`
    const res = await axios.get(cgcUrl)
    if (res.status === 200) {
      return res.data && res.data.prices
    }
    return []
  } catch {
    return []
  }
}
