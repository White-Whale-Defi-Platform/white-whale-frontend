import { ChainId, WalletChainName } from 'constants/index'
import { atom } from 'recoil'

export enum NetworkType {
  testnet = 'testnet',
  mainnet = 'mainnet',
}

type GeneratedWalletState<TStateExtension extends NonNullable<unknown>> = TStateExtension & {
  chainId: string
  chainName: string
  network: NetworkType
  activeWallet: string
  walletChainName:string
}

type CreateWalletStateArgs<TState = NonNullable<unknown>> = {
  key: string
  default: TState
}

const createWalletState = ({
  key,
  default: defaultState,
}: CreateWalletStateArgs<NonNullable<unknown>>) => atom<GeneratedWalletState<NonNullable<unknown>>>({
  key,
  default: {
    chainId: ChainId.migaloo,
    chainName: WalletChainName.migaloo,
    network: NetworkType.mainnet,
    activeWallet: '',
    walletChainName: WalletChainName.migaloo,
    ...defaultState,
  },
  dangerouslyAllowMutability: true,
})

export const chainState = createWalletState({
  key: 'internal-wallet',
  default: {
    key: null,
  },
})
