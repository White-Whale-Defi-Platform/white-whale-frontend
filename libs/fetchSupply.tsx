import { fetchWithTimeout, getFastestAPI } from 'services/useAPI'

export type FetchSupplyResponse = {
  circulating: number
  total: number
}

const fallbackUrl = '/api/cors?url=https://apex.migaloo.zone/api/supply'
export const fetchSupply = async (): Promise<FetchSupplyResponse> => {
  const api = await getFastestAPI()

  try {
    const response = api
      ? await fetchWithTimeout(`${api}/apex/supply`, 10000)
      : await fetch(fallbackUrl)
    let data = await response.json()
    data = data?.data ? data.data : data
    return data
  } catch (error) {
    console.error('Unable to fetch supply data:', error)
    return {
      circulating: 0,
      total: 0
    }
  }
}

