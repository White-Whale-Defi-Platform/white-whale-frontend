import { atom } from 'recoil'
import { TokenItemState } from 'types/index'

export const tokenItemState = atom<[TokenItemState?, TokenItemState?]>({
  key: 'tokenLPState',
  default: [],
  effects_UNSTABLE: [
    function validateIfTokensAreSame({ onSet, setSelf }) {
      onSet((newValue, oldValue) => {
        const [tokenA, tokenB] = newValue
        if (tokenA && tokenB && tokenA.tokenSymbol === tokenB.tokenSymbol) {
          requestAnimationFrame(() => {
            const A = { ...oldValue[1],
              amount: oldValue[0].amount }
            const B = { ...oldValue[0],
              amount: oldValue[1].amount }
            setSelf([A, B])
          })
        }
      })
    },
  ],
})
