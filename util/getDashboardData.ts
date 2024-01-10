import { ENIGMA_URL } from 'constants/index'
import fetch from 'isomorphic-unfetch'

interface ChainInfoResponse {
  chainName: string;
  tvl: number;
  volume24h: number
}

export const getDashboardData = async (): Promise<ChainInfoResponse[]> => {
  const response = await fetch(`${ENIGMA_URL}/chains/dashboard`)
  const data : ChainInfoResponse[] = await response.json()
  return data.map((res) => {
    if (res.chainName === 'terra-classic') {
      return {
        ...res,
        chainName: 'terra',
      }
    } else if (res.chainName === 'terra') {
      return {
        ...res,
        chainName: 'terra2',
      }
    } else {
      return res
    }
  })
}
