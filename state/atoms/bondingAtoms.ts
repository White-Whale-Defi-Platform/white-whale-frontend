import { atom } from 'recoil'

export enum BondingSummaryStatus{
  uninitialized,
  available,
  loading,
  restored
}

type GeneratedBondingSummaryState<
  TClient extends any,
  TStateExtension extends {}
> = TStateExtension & {
  status: BondingSummaryStatus,
  unbondingPeriod: number,
  edgeTokenList: Array<string>,
  liquidAmpWhale : number,
  liquidBWhale : number,
  bondedAmpWhale : number,
  bondedBWhale : number,
  unbondingAmpWhale : number,
  unbondingBWhale : number,
  withdrawableAmpWhale : number,
  withdrawableBWhale : number,
}

type CreateBondingSummaryStateArgs<TState = {}> = {
  key: string
  default: TState
}

function createBondingSummaryState<TClient = any, TState = {}>({
                                                         key,
                                                         default: defaultState,
                                                       }: CreateBondingSummaryStateArgs<TState>) {

  return atom<GeneratedBondingSummaryState<TClient, TState>>({
    key,
    default: {
      status: BondingSummaryStatus.uninitialized,
      unbondingPeriod: null,
      edgeTokenList: null,
      liquidAmpWhale : null,
      liquidBWhale : null,
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
                status: BondingSummaryStatus.restored,
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

export const bondingSummaryState = createBondingSummaryState({
  key: 'bonding',
  default: {
  },
})
