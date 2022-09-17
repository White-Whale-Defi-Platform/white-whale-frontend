import { atom } from 'recoil'

export const activeWalletAtom = atom({
  key: 'activeWallet',
  default: 'keplr',
})
