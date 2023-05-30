import { atom } from 'recoil'

export const txAtom = atom({
    key: 'txAtom',
    default: {
        txStep : 0,
        txHash : undefined,
        error : null,
        buttonLabel : null,
    },
})
