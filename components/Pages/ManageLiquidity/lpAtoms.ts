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
            const A = {...oldValue[1], amount : oldValue[0].amount}
            const B = {...oldValue[0], amount : oldValue[1].amount}
            setSelf([A,B])
          })
        }
      })
    },
  ],
})

// export const slippageAtom = atom<number>({
//   key: 'slippageForSwap',
//   default: 0.01,
// })
