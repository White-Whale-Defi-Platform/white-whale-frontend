import { useQuery } from 'react-query'

import { isDevMode } from 'util/isDevMode'

const getCoinGecko = async (ids = []) => {
  try {
    const newApiIds = [...new Set(ids)].filter((elem) => typeof elem === 'string').join()

    // Fetch directly from CoinGecko API (no custom API endpoint for this)
    const response = isDevMode() ?
      await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${newApiIds.split(',')}&vs_currencies=usd`) :
      await fetch(`/api/coingecko?ids=${newApiIds}`)

    if (!response.ok) {
      console.error('CoinGecko API request failed:', response.statusText)
      return {}
    }

    const apiValues = await response.json()
    return apiValues || {}
  } catch (error) {
    console.error('Error fetching CoinGecko prices:', error)
    return {}
  }
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
