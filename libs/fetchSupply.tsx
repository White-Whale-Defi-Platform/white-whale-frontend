export type FetchSupplyResponse = {
  circulating: number
  total: number
}

const url = '/api/cors?url=https://apex.migaloo.zone/api/supply'
export const fetchSupply = async (): Promise<FetchSupplyResponse> => await (await fetch(url)).json()

