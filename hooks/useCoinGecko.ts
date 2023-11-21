import { useQuery } from 'react-query'

const getCoinGecko = async (ids = []) => {
  const newApiIds = [...new Set(ids)].join(',')

  const coinGeckoUrl = `/api/cors?url=https://api.coingecko.com/api/v3/simple/price?ids=${newApiIds}&vs_currencies=usd`

  const response = await fetch(coinGeckoUrl)
  return await response.json()
}

const useCoinGecko = (ids: string[]) => {
  const { data } = useQuery({
    queryKey: ['coinGecko', ids],
    queryFn: () => getCoinGecko(ids),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    enabled: ids?.length > 0,
  })

  return data
}

export default useCoinGecko
