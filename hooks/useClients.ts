import { useQueries } from 'react-query'

import { InjectiveStargate } from '@injectivelabs/sdk-ts'
import { getEndpoint, assertIsDefined } from '@quirks/core'
import { useConnect } from '@quirks/react';
import { getOfflineSigner, getSigningCosmWasmClient, store } from '@quirks/store';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';

const getCosmWasmClient = async (walletChainName: string) => {
  const state = store.getState();

  const chain = store.getState().chains.find((el) => el.chain_name === walletChainName);
  assertIsDefined(chain);
  const endpoint = getEndpoint(walletChainName, state.chains);

  const { CosmWasmClient } = await import('@cosmjs/cosmwasm-stargate');

  console.log(endpoint)

  return CosmWasmClient.connect(endpoint.rpc.address);
}

export const useClients = (walletChainName: string) => {
  const { connected } = useConnect();

  const queries = useQueries([
    {
      queryKey: ['cosmWasmClient', walletChainName],
      queryFn: async () => await getCosmWasmClient(walletChainName),
    },
    {
      queryKey: ['signingClient', walletChainName],
      queryFn: async () => await getSigningCosmWasmClient(walletChainName),
      enabled: connected,
    }, {
      queryKey: ['injectiveSigningClient'],
      queryFn: async () => {
        try {
          const offlineSigner: any = await getOfflineSigner(walletChainName, 'direct');
          const client = await InjectiveStargate.InjectiveSigningStargateClient.connectWithSigner('https://sentry.tm.injective.network:443',
            offlineSigner)
          client.registry.register('/cosmwasm.wasm.v1.MsgExecuteContract', MsgExecuteContract)
          return client
        } catch {
          return null
        }
      },
      enabled: connected,
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
