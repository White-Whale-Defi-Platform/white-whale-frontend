import { atom } from 'recoil'

export const txRecoilState = atom({
  key: 'txRecoilState',
  default: {
    txStep: 0,
    txHash: undefined,
    error: null,
    buttonLabel: null,
  },
})
