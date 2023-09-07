import { useQueries } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite'

export const useClients = (chainName: string) => {
  const {
    getCosmWasmClient,
    getSigningCosmWasmClient,
    isWalletConnected,
  } = useChain(chainName)

  const queries = useQueries([
    {
      queryKey: 'cosmWasmClient',
      queryFn: async () => await getCosmWasmClient(),
    },
    {
      queryKey: 'signingClient',
      queryFn: async () => await getSigningCosmWasmClient(),
      enabled: isWalletConnected,
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
