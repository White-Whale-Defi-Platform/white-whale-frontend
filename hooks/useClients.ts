import { useQueries } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite'
import { InjectiveStargate } from '@injectivelabs/sdk-ts'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';

export const useClients = (walletChainName: string) => {
  const {
    getCosmWasmClient,
    getSigningCosmWasmClient,
    isWalletConnected,
    setDefaultSignOptions,
    wallet,
    getOfflineSignerDirect } = useChain(walletChainName)
  if (isWalletConnected && wallet?.name !== 'station-extension') {
    try {
      setDefaultSignOptions({
        preferNoSetFee: true,
        preferNoSetMemo: true,
        disableBalanceCheck: true,
      })
    } catch {
      console.error(`unable to set Default option for: ${wallet.name}`)
    }
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
    }, {
      queryKey: ['injectiveSigningClient'],
      queryFn: async () => {
        try {
          const offlineSigner: any = await getOfflineSignerDirect();
          const client = await InjectiveStargate.InjectiveSigningStargateClient.connectWithSigner('https://sentry.tm.injective.network:443',
            offlineSigner)
          client.registry.register('/cosmwasm.wasm.v1.MsgExecuteContract', MsgExecuteContract)
          return client
        } catch {
          return null
        }
      },
      enabled: isWalletConnected,
    },
  ])

  // Check if both queries are in loading state
  const isLoading = queries.every((query) => query.isLoading)

  return {
    isLoading,
    cosmWasmClient: queries[0].data,
    signingClient: queries[1].data,
    injectiveSigningClient: queries[2].data,
  }
}
