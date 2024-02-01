import { BondingTokenState } from 'components/Pages/Bonding/BondingActions/Bond'
import { atom } from 'recoil'

export const bondingState = atom<BondingTokenState>({
  key: 'bondingToken',
  default: {
    tokenSymbol: null,
    amount: 0,
    decimals: 6,
    denom: null,
  },
  effects_UNSTABLE: [],
})
