import axios from 'axios'
import moment from 'moment'

const coingeckoV3RootUrl = 'https://api.coingecko.com/api/v3/coins'

export const getTokenCGCId = (address: string) => {
  let tokenCGCId = ''

  switch (address) {
    case 'ujuno':
      // juno
      tokenCGCId = 'juno-network'
      break
    case 'ibc/107D152BB3176FAEBF4C2A84C5FFDEEA7C7CB4FE1BBDAB710F1FD25BCD055CBF':
      // juno
      tokenCGCId = 'juno-network'
      break
    case 'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9':
      // atom
      tokenCGCId = 'cosmos'
      break
    case 'ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034':
      // axlUsdc
      tokenCGCId = 'axlusdc'
      break
    case 'juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup':
      // loop
      tokenCGCId = 'loop'
      break
    case 'juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g':
      // raw
      tokenCGCId = 'junoswap-raw-dao'
      break

    case 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7':
      // raw
      tokenCGCId = 'tether'
      break
    case 'inj':
      // raw
      tokenCGCId = 'injective-protocol'
      break
    case 'ucmdx':
      // raw
      tokenCGCId = 'comdex'
      break
    case 'ucmst':
      // raw
      tokenCGCId = 'axlusdc'
      break
    case 'ibc/961FA3E54F5DCCA639F37A7C45F7BBE41815579EF1513B5AFBEFCFEB8F256352':
      // raw
      tokenCGCId = 'cosmos'
      break

    default:
      break
  }
  return tokenCGCId
}

export const getCGCTokenHistoryPriceUrl = (id: string, timestamp: number) => {
  const dateTime = moment(new Date(timestamp - (timestamp % 86400000))).format(
    'DD-MM-YYYY'
  )

  return `${coingeckoV3RootUrl}/${id}/history?date=${dateTime}&localization=false`
}

export const getTokenPrice = async (address: string, timestamp?: number) => {
  const tokenCGCId = getTokenCGCId(address)
  if (tokenCGCId === '' || !timestamp) return 1

  try {
    const cgcUrl = getCGCTokenHistoryPriceUrl(
      tokenCGCId,
      moment(timestamp).valueOf()
    )

    const res = await axios.get(cgcUrl)
    if (res.status === 200) {
      return res.data && res.data.market_data.current_price['usd']
    }
    return 1
  } catch {
    return 1
  }
}
