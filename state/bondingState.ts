import { atom } from 'recoil'

import { BondingTokenState } from './Bond'

export const bondingAtom = atom<BondingTokenState>({
  key: 'bondingToken',
  default: {
    tokenSymbol: null,
    amount: 0,
    decimals: 6,
    denom: null,
  },
  effects_UNSTABLE: [],
})
