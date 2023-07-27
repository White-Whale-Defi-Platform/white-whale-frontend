import { atom } from 'recoil'

import { LSDTokenItemState } from './Bond'

export const bondingAtom = atom<LSDTokenItemState>({
  key: 'bondingToken',
  default: {
    tokenSymbol: null,
    amount: 0,
    decimals: 6,
    lsdToken: null,
  },
  effects_UNSTABLE: [],
})
