import { useMemo } from 'react'
import { useQueries } from 'react-query'

export function useQueriesDataSelector<
  TQueries extends ReturnType<typeof useQueries>
>(queriesResult: TQueries) {
  const [data, isLoading, isError] = useMemo(() => {
    const loading = queriesResult.some(({ isLoading: _isLoading, data: _data }) => _isLoading && !_data)
    const error = queriesResult.some(({ isError: _isError }) => _isError)
    const queriesData: Array<TQueries[number]['data']> = queriesResult?.map(({ data: _data }) => _data)
    const didFetchEveryQuery = queriesData && !queriesData.includes(undefined)

    return [
      didFetchEveryQuery ? queriesData : undefined,
      loading,
      error,
    ] as const
  }, [queriesResult])

  return [data, isLoading, isError] as const
}
