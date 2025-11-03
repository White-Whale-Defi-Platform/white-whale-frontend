import { fetchWithTimeout, getFastestAPI } from 'services/useAPI';

export interface ChainInfoResponse {
  chainName: string;
  tvl: number;
  volume24h: number
}

export const getDashboardData = async (): Promise<ChainInfoResponse[]> => {
  const api = await getFastestAPI()
  if (!api) return []

  try {
    const response = await fetchWithTimeout(`${api}/api/dashboard`, 10000)
    let data: ChainInfoResponse[] | any = await response.json()
    data = (data?.data ? data.data : data).filter((e) => e !== null)
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
  } catch (error) {
    console.error('Unable to fetch dashboard data:', error)
    return []
  }
}
