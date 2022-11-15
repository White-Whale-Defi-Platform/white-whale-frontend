import { atom } from 'recoil'

export type TokenItemState = {
  tokenSymbol: string
  amount: number
  decimals: number
}

export const tokenSwapAtom = atom<[TokenItemState, TokenItemState]>({
  key: 'tokenSwap',
  default: [
    {
      tokenSymbol: null,
      amount: 0,
      decimals: 6,
    },
    {
      tokenSymbol: null,
      amount: 0,
      decimals: 6,
    },
  ],
  effects_UNSTABLE: [
    function validateIfTokensAreSame({ onSet, setSelf }) {
      onSet((newValue, oldValue) => {
        const [tokenA, tokenB] = newValue
        if (tokenA.tokenSymbol === tokenB.tokenSymbol) {
          requestAnimationFrame(() => {
            const A = { ...oldValue[1], amount: oldValue[0].amount }
            const B = { ...oldValue[0], amount: oldValue[1].amount }
            setSelf([A, B])
          })
          // requestAnimationFrame(() => {
          //   setSelf([oldValue[1], oldValue[0]])
          // })
        }
      })
    },
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
