import { useQueries } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite'

export const useClients = (walletChainName: string) => {
  const {
    getCosmWasmClient,
    getSigningCosmWasmClient,
    isWalletConnected,
    setDefaultSignOptions,
  } = useChain(walletChainName)
  if (isWalletConnected) {
    setDefaultSignOptions({
      preferNoSetFee: true,
      preferNoSetMemo: true,
      disableBalanceCheck: true,
    })
  }
  const queries = useQueries([
    {
      queryKey: ['cosmWasmClient', walletChainName],
      queryFn: async () => await getCosmWasmClient(),
    },
    {
      queryKey: ['signingClient', walletChainName],
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
