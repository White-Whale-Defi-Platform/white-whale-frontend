import { useMemo } from 'react'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

const ignoreCoinhall = ['chihuahua', 'injective']

const useIgnoreCoinhall = () => {
  const { chainId } = useRecoilValue(walletState)
  return useMemo(
    () => !ignoreCoinhall.includes(chainId?.split('-')?.[0]),
    [chainId]
  )
}

export default useIgnoreCoinhall
