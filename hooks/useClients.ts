import { useQueries } from 'react-query'

import { GeneratedType, Registry } from '@cosmjs/proto-signing';
import { AminoTypes } from '@cosmjs/stargate';
import { useChain } from '@cosmos-kit/react-lite'
import { InjectiveStargate } from '@injectivelabs/sdk-ts'
import {
  cosmosAminoConverters,
  cosmosProtoRegistry,
  cosmwasmAminoConverters,
  cosmwasmProtoRegistry,
} from 'util/inj-types';

export const useClients = (walletChainName: string) => {
  const {
    getCosmWasmClient,
    getSigningCosmWasmClient,
    isWalletConnected,
    setDefaultSignOptions,
    wallet, getOfflineSigner } = useChain(walletChainName)
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
          const offlineSigner: any = await getOfflineSigner()
          const protoRegistry: ReadonlyArray<[string, GeneratedType]> = [
            ...cosmosProtoRegistry,
            ...cosmwasmProtoRegistry,
          ];
          const aminoConverters = {
            ...cosmosAminoConverters,
            ...cosmwasmAminoConverters,
          };
          const registry = new Registry(protoRegistry);
          const aminoTypes = new AminoTypes(aminoConverters);
          const client = await InjectiveStargate.InjectiveSigningStargateClient.connectWithSigner(
            'https://sentry.tm.injective.network:443',
            offlineSigner, {
              registry,
              aminoTypes,
            },
          )
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
