// import { atom } from 'recoil'
//
//
// export const stackViewAtom = atom<boolean>({
//     key: 'stackView',
//     // default: true,
//     dangerouslyAllowMutability: true,
//     effects_UNSTABLE: [
//         ({ onSet, setSelf }) => {
//             const CACHE_KEY = `stackView`
//             const savedValue = localStorage.getItem(CACHE_KEY)
//             console.log('savedValue', savedValue)
//             setSelf(savedValue === 'true' ? true : false)
//
//             onSet((newValue, oldValue) => {
//                 localStorage.setItem(
//                     CACHE_KEY,
//                     newValue.toString()
//                 )
//             })
//         },
//     ],
// })
