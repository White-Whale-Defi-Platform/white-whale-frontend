import { useQueries } from 'react-query'

import { GasPrice } from '@cosmjs/stargate';
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
    chain,
    getOfflineSignerDirect,
  } = useChain(walletChainName)
  if (isWalletConnected && !wallet.name.includes('station')) {
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
      queryFn: async () => {
        if (!chain.chain_name.includes('injective')) {
          return await getSigningCosmWasmClient()
        } else { // Get the offline signer
          const offlineSigner : any = await getOfflineSignerDirect();
          const [account] = await offlineSigner.getAccounts();
          const client = await InjectiveStargate.InjectiveSigningStargateClient.connectWithSigner(
            'https://ww-injective-rpc.polkachu.com',
            offlineSigner,
          )
          client.registry.register('/cosmwasm.wasm.v1.MsgExecuteContract', MsgExecuteContract);
          return client
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
  }
}
