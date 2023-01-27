import { useEffect, useState } from 'react'

import axios from 'axios'
import { getTokenCGCId } from 'util/coingecko'

const tokenList = [
  'ujuno',
  'ibc/107D152BB3176FAEBF4C2A84C5FFDEEA7C7CB4FE1BBDAB710F1FD25BCD055CBF',
  'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9',
  'ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034',
  'juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup',
  'juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g',
  'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7',
  'inj',
  'ucmdx',
  'ucmst',
  'ibc/961FA3E54F5DCCA639F37A7C45F7BBE41815579EF1513B5AFBEFCFEB8F256352',
]

export const useTokenPrice = () => {
  const [tokenPrices, setTokenPrices] = useState({})

  const fetchPrices = async () => {
    const tokenIds = tokenList.map((row) => {
      return getTokenCGCId(row)
    })
    const apiIds = tokenIds.flat().join(',')
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${apiIds}&vs_currencies=usd`

    const res = await axios.get(url)
    if (res.status === 200) {
      let _tokenPrices = {}
      Object.entries(res.data).map((row: any) => {
        _tokenPrices = { ..._tokenPrices, [row[0]]: row[1].usd }
      })
      setTokenPrices(_tokenPrices)
    }
  }

  useEffect(() => {
    fetchPrices()
    setInterval(() => {
      fetchPrices()
    }, 60000)
  }, [])

  return { tokenPrices }
}
