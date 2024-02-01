import { API_URL } from '../constants'

export type FetchSupplyResponse = {
  circulating: number
  total: number
}

const url = '/api/cors?url=https://apex.migaloo.zone/api/supply'
export const fetchSupply = async (): Promise<FetchSupplyResponse> => {
  const response = await fetch(`${API_URL}/apex/supply`) || await fetch(url)
  let data = await response.json()
  data = data?.data ? data.data : data
  return data
}

