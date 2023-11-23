import { useQuery } from 'react-query'

const getCoinGecko = async (ids = []) => {
  const newApiIds = [...new Set(ids)].filter((elem) => typeof elem === 'string').join()
  const response = await fetch(`/api/coingecko?ids=${newApiIds}`);
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
