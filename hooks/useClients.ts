import { useQueries } from 'react-query'
import { useChain } from '@cosmos-kit/react-lite'

export function useClients(chainName) {
  const { getCosmWasmClient, getSigningCosmWasmClient } = useChain(chainName)

  const queries = useQueries([
    {
      queryKey: 'cosmWasmClient',
      queryFn: async () => await getCosmWasmClient(),
    },
    {
      queryKey: 'signingClient',
      queryFn: async () => await getSigningCosmWasmClient(),
    },
  ])

  // Check if both queries are in loading state
  const isLoading = queries.every((query) => query.isLoading)

  return {
    isLoading,
    cosmWasmClient: queries[0].data,
    signingClient: queries[1].data,
  }
}
