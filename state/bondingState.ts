import { atom } from 'recoil'

import { LSDTokenItemState } from 'components/Pages/BondingActions/Bond'

export const bondingState = atom<LSDTokenItemState>({
  key: 'bondingToken',
  default: {
    tokenSymbol: null,
    amount: 0,
    decimals: 6,
    lsdToken: null,
  },
  effects_UNSTABLE: [],
})
