import { useQueries } from 'react-query'
import { useChain } from '@cosmos-kit/react-lite'
import { useMemo } from 'react'
import { WalletType } from 'components/Wallet/Modal/WalletModal'

export function useClients(chainName) {
  const {
    getCosmWasmClient,
    getSigningCosmWasmClient,
    isWalletConnected,
    signAndBroadcast,
    wallet,
  } = useChain(chainName)

  const isStation = useMemo(
    () => wallet?.name === WalletType.terraExtension,
    [wallet]
  )
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
