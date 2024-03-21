import { fetchWithTimeout, getFastestAPI } from 'services/useAPI'

export type FetchSupplyResponse = {
  circulating: number
  total: number
}

const url = '/api/cors?url=https://apex.migaloo.zone/api/supply'
export const fetchSupply = async (): Promise<FetchSupplyResponse> => {
  const response = await fetchWithTimeout(`${await getFastestAPI()}/apex/supply`, 1000) || await fetch(url)
  let data = await response.json()
  data = data?.data ? data.data : data
  return data
}

