import { Key } from '@keplr-wallet/types'
import { atom } from 'recoil'

type GeneratedWalletState<TStateExtension extends NonNullable<unknown>> = TStateExtension & {
  chainId: string
  chainName: string
  network: NetworkType
  activeWallet: string
  walletChainName:string
}
export enum NetworkType {
  testnet = 'testnet',
  mainnet = 'mainnet',
}

type CreateWalletStateArgs<TState = NonNullable<unknown>> = {
  key: string
  default: TState
}

function createWalletState<TState = NonNullable<unknown>>({
  key,
  default: defaultState,
}: CreateWalletStateArgs<TState>) {
  return atom<GeneratedWalletState<TState>>({
    key,
    default: {
      chainId: 'migaloo-1',
      chainName: 'migaloo',
      network: NetworkType.mainnet,
      activeWallet: '',
      walletChainName: 'migaloo',
      ...defaultState,
    },
    dangerouslyAllowMutability: true,
  })
}

export const chainState = createWalletState<{ key?: Key }>({
  key: 'internal-wallet',
  default: {
    key: null,
  },
})
