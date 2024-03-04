import { ENIGMA_URL } from 'constants/index'
import { fetchWithTimeout, getFastestAPI } from 'services/useAPI';

interface ChainInfoResponse {
  chainName: string;
  tvl: number;
  volume24h: number
}

export const getDashboardData = async (): Promise<ChainInfoResponse[]> => {
  const response = await fetchWithTimeout(`${await getFastestAPI()}/api/dashboard`, 10000) || await fetch(`${ENIGMA_URL}/chains/dashboard`)

  let data: ChainInfoResponse[] | any = await response.json()
  data = data?.data ? data.data : data
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
