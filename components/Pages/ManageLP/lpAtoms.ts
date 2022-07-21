import { atom } from 'recoil'

export type TokenItemState = {
  tokenSymbol: string
  amount: number
}

export const tokenLpAtom = atom<[TokenItemState, TokenItemState]>({
  key: 'tokenLP',
  default: [
    {
      tokenSymbol: null,
      amount: 0,
    },
    {
      tokenSymbol: null,
      amount: 0,
    },
  ],
  effects_UNSTABLE: [
    function validateIfTokensAreSame({ onSet, setSelf }) {
      onSet((newValue, oldValue) => {
        const [tokenA, tokenB] = newValue
        if (tokenA.tokenSymbol === tokenB.tokenSymbol) {
          requestAnimationFrame(() => {
            setSelf([oldValue[1], oldValue[0]])
          })
        }
      })
    },
  ],
})

export const slippageAtom = atom<number>({
  key: 'slippageForSwap',
  default: 0.01,
})
