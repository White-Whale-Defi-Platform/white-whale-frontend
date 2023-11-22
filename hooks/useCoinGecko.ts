import { useQuery } from 'react-query'

const getCoinGecko = async (ids = []) => {
  const newApiIds = [...new Set(ids)].join(',')

  const response = await fetch(`/api/coingecko?ids=${newApiIds}`);

  return await response.json()
}

const useCoinGecko = (ids: string[]) => {
  const areAllStrings = ids.every((element) => typeof element === 'string');
  const { data } = useQuery({
    queryKey: ['coinGecko', ids],
    queryFn: () => getCoinGecko(ids),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    enabled: areAllStrings && ids?.length > 0,
  })

  return data
}

export default useCoinGecko
