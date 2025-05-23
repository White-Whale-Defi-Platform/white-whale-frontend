import { useQueries } from 'react-query'

import { GeneratedType, Registry } from '@cosmjs/proto-signing'
import { AminoTypes, SigningStargateClient } from '@cosmjs/stargate'
import { useChain } from '@cosmos-kit/react-lite'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import {
  cosmosAminoConverters,
  cosmosProtoRegistry,
  cosmwasmAminoConverters,
  cosmwasmProtoRegistry,
} from '@nick134-bit/nicks-injectivejs'
import { allianceAminoConverters, allianceProtoRegistry } from 'migaloojs'


export const useClients = (walletChainName: string) => {
  const {
    getCosmWasmClient,
    getSigningCosmWasmClient,
    isWalletConnected,
    setDefaultSignOptions,
    getStargateClient,
    wallet, getRpcEndpoint, getOfflineSigner } = useChain(walletChainName)

  if (isWalletConnected && !wallet?.name.includes('station')) {
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
      queryFn: async () => { if (walletChainName !== 'migaloo') {
        return await getSigningCosmWasmClient()
      } else {
        const offlineSigner: any = await getOfflineSigner()
        const protoRegistry: ReadonlyArray<[string, GeneratedType]> = [
          ...cosmosProtoRegistry,
          ...cosmwasmProtoRegistry,
          ...allianceProtoRegistry,
        ];
        const aminoConverters = {
          ...cosmosAminoConverters,
          ...cosmwasmAminoConverters,
          ...allianceAminoConverters,
        };
        const registry: any = new Registry(protoRegistry);
        const aminoTypes = new AminoTypes(aminoConverters);
          const endpoint = await getRpcEndpoint()
          return await SigningStargateClient.connectWithSigner(
            endpoint,
            offlineSigner, {
              registry,
              aminoTypes,
            },
          )
      }},
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
          const registry: any = new Registry(protoRegistry);
          const aminoTypes = new AminoTypes(aminoConverters);
          const endpoint = await getRpcEndpoint()
          return await InjectiveSigningStargateClient.connectWithSigner(
            endpoint,
            offlineSigner, {
              registry,
              aminoTypes,
            },
          )
        } catch {
          return null
        }
      },
      enabled: isWalletConnected,
    },
    {
      queryKey: ['stargateClient', walletChainName],
      queryFn: async () => await getStargateClient(),
    },
  ])

  // Check if both queries are in loading state
  const isLoading = queries.every((query) => query.isLoading)

  return {
    isLoading,
    cosmWasmClient: queries[0].data,
    signingClient: queries[1].data,
    injectiveSigningClient: queries[2].data,
    stargateClient: queries[3].data,
  }
}
