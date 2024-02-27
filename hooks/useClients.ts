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
    getOfflineSignerDirect, getOfflineSigner } = useChain(walletChainName)
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
        let offlineSigner:any
        try {
          try {
           offlineSigner = await getOfflineSignerDirect();
          } catch {
            // getOfflineSignerDirect not available for OKX-WALLET in cosmos-kit
             offlineSigner = await getOfflineSigner()
          }
          // DEBUG for OKX-WALLET 
          // difference can only be reproduced with Keplr Extension installed as well
          console.log('1) getKey() response from Keplr on injective', await window.keplr.getKey('injective-1'),'2) getKey() response from OKX-Wallet on injective',await window.okxwallet.keplr.getKey('injective-1'))
          console.log('1) getKey() response from Keplr on osmosis', await window.keplr.getKey('osmosis-1'),'2) getKey() response from OKX-Wallet on osmosis' ,await window.okxwallet.keplr.getKey('osmosis-1'))
          console.log('osmosis works, injective not. Difference in pub key algo and pub key length')
          const client = await InjectiveStargate.InjectiveSigningStargateClient.connectWithSigner('https://sentry.tm.injective.network:443',
            offlineSigner)
          client.registry.register('/cosmwasm.wasm.v1.MsgExecuteContract', MsgExecuteContract)
          return client
        } catch (e){
          console.log(e)
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
