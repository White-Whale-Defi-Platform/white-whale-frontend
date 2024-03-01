import { atom } from 'recoil'

export const walletModalState = atom({
  key: 'walletModalState',
  default: {
    open: false,
  },
})
