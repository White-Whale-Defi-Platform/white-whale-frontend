import { useMemo } from 'react'
import { useQueries } from 'react-query'

import { fetchSupply } from 'libs/fetchSupply'
import { debounce } from 'lodash'
import { getBondingAPRsAPI } from 'services/useAPI'
import { getDashboardData } from 'util/getDashboardData'

export const useGetDashboardDataAPI = () => {
  const debouncedRefetch = useMemo(() => debounce((refetchFunc) => refetchFunc(), 500),
    [])

  const queries = useQueries([
    {
      queryKey: ['WHALEsupply'],
      queryFn: () => fetchSupply(),
      refetchOnMount: 'always',
      refetchInterval: 180000
    },
    {
      queryKey: ['dashBoardData'],
      queryFn: () => getDashboardData(),
      refetchOnMount: 'always',
      refetchInterval: 180000
    },
    {
      queryKey: ['bondingInfos'],
      queryFn: () => getBondingAPRsAPI(),
      refetchOnMount: 'always',
      refetchInterval: 180000
    },
  ])

  const isLoading = useMemo(() => queries.some((query) => (
    query.isLoading || (!query.data && query.data !== 0)
  )),
  [queries])

  const refetchAll = () => {
    queries.forEach((query) => {
      debouncedRefetch(query.refetch)
    })
  }

  const data = useMemo(() => {
    const supply = queries[0].data
    const dashboardData = queries[1].data
    const bondingInfos = queries[2].data

    return { supply,
      dashboardData,
      bondingInfos }
  }, [queries])

  return { data,
    isLoading,
    refetch: refetchAll }
}
