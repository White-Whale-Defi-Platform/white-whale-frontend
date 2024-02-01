import { useQuery } from 'react-query'

import { getPricesAPI } from 'services/useAPI'
import { isDevMode } from 'util/isDevMode'

const getCoinGecko = async (ids = []) => {
  const newApiIds = [...new Set(ids)].filter((elem) => typeof elem === 'string').join()
  let apiValues: any = await getPricesAPI(newApiIds.split(','))
  if (!apiValues) {
    const response = isDevMode() ? await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${newApiIds.split(',')}&vs_currencies=usd`) :
      await fetch(`/api/coingecko?ids=${newApiIds}`)
    apiValues = await response.json()
    console.log('apiValues', apiValues)
  }
  return apiValues
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
