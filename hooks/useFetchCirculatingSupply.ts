import { useQuery } from 'react-query'

import { fetchSupply } from 'libs/fetchSupply'

export const useFetchCirculatingSupply = () => {
  const { data } = useQuery(
    'whaleSupply', () => fetchSupply(), {
      refetchInterval: 10000,
      staleTime: 10000,
    },
  )
  return data ? (data.circulating / (10 ** 6)) : null
}

