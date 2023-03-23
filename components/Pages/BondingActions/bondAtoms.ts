import { atom } from 'recoil'
import {TokenItemState} from "../../../types";



export const bondingAtom = atom<TokenItemState>({
  key: 'bondingToken',
  default:
    {
      tokenSymbol: null,
      amount: 0,
      decimals: 6,
    },
  effects_UNSTABLE: [
  ],
})

export const slippageAtom = atom<number>({
  key: 'slippageForSwap',
  default: 0.1,
  effects_UNSTABLE: [
    ({ onSet, setSelf }) => {
      const slippage = localStorage.getItem('slippage')
      setSelf(Number(slippage))

      onSet((newValue, oldValue) => {
        const isReset = !!!newValue

        if (isReset) {
          localStorage.removeItem('slippage')
        } else {
          localStorage.setItem('slippage', String(newValue))
        }
      })
    },
  ],
})
