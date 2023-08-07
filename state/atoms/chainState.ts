import { Key } from '@keplr-wallet/types'
import { atom } from 'recoil'
import { Wallet } from 'util/wallet-adapters'

type GeneratedWalletState<
  TClient extends any,
  TStateExtension extends {}
> = TStateExtension & {
  client: TClient | null
  address: string
  chainId: string
  chainName: string
  network: NetworkType
  activeWallet: string
}
export enum NetworkType {
  testnet = 'testnet',
  mainnet = 'mainnet',
}

type CreateWalletStateArgs<TState = {}> = {
  key: string
  default: TState
}

function createWalletState<TClient = any, TState = {}>({
  key,
  default: defaultState,
}: CreateWalletStateArgs<TState>) {
  return atom<GeneratedWalletState<TClient, TState>>({
    key,
    default: {
      client: null,
      chainId: null,
      chainName: 'migaloo',
      address: '',
      network: NetworkType.mainnet,
      activeWallet: '',
      ...defaultState,
    },
    dangerouslyAllowMutability: true,
    effects_UNSTABLE: [
      ({ onSet, setSelf }) => {
        const CACHE_KEY = `@wasmswap/wallet-state/wallet-type-${key}`
        const savedValue = localStorage.getItem(CACHE_KEY)
        if (savedValue) {
          try {
            const parsedSavedState = JSON.parse(savedValue)
            if (parsedSavedState?.address) {
              setSelf({
                ...parsedSavedState,
                client: null,
              })
            }
          } catch (e) {}
        }

        onSet((newValue, oldValue) => {
          localStorage.setItem(
            CACHE_KEY,
            /* Let's not store the client in the cache */
            JSON.stringify({ ...newValue, client: null })
          )
          // }
        })
      },
    ],
  })
}

export const chainState = createWalletState<Wallet, { key?: Key }>({
  key: 'internal-wallet',
  default: {
    key: null,
  },
})
