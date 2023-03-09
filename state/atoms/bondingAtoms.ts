import { atom } from 'recoil'

export enum BondingStatus{
  uninitialized,
  available,
  loading,
  restored
}

type GeneratedBondingState<
  TClient extends any,
  TStateExtension extends {}
> = TStateExtension & {
  status: BondingStatus,
  edgeTokenList: Array<string>,
  bondedAmpWhale : number,
  bondedBWhale : number,
  unbondingAmpWhale : number,
  unbondingBWhale : number,
  withdrawableAmpWhale : number,
  withdrawableBWhale : number,
}

type CreateBondingStateArgs<TState = {}> = {
  key: string
  default: TState
}

function createBondingState<TClient = any, TState = {}>({
                                                         key,
                                                         default: defaultState,
                                                       }: CreateBondingStateArgs<TState>) {

  return atom<GeneratedBondingState<TClient, TState>>({
    key,
    default: {
      status: BondingStatus.uninitialized,
      edgeTokenList: ["ampWHALE", "bWHALE"],
      bondedAmpWhale : null,
      bondedBWhale : null,
      unbondingAmpWhale : null,
      unbondingBWhale : null,
      withdrawableAmpWhale : null,
      withdrawableBWhale : null,
      ...defaultState,
    },
    dangerouslyAllowMutability: true,
    effects_UNSTABLE: [
      ({ onSet, setSelf }) => {
        const CACHE_KEY = `@wasmswap/bonding-state/bonding-type-${key}`
        const savedValue = localStorage.getItem(CACHE_KEY)
        if (savedValue) {
          try {
            const parsedSavedState = JSON.parse(savedValue)
            if (parsedSavedState?.address) {
              setSelf({
                ...parsedSavedState,
                client: null,
                status: BondingStatus.restored,
              })
            }
          } catch (e) {}
        }

        onSet((newValue, oldValue) => {
          // const isReset = newValue.address !== (oldValue as any)?.address

          // if (isReset) {
          //   localStorage.removeItem(CACHE_KEY)
          // } else {
          localStorage.setItem(
            CACHE_KEY,
            /* let's not store the client in the cache */
            JSON.stringify({ ...newValue, client: null })
          )
          // }
        })
      },
    ],
  })
}

export const bondingState = createBondingState({
  key: 'bonding',
  default: {
  },
})
