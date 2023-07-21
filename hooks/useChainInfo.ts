import { useMemo } from 'react'

import mainnetChainInfo from 'public/mainnet/chain_info.json'
import testnetChainInfo from 'public/testnet/chain_info.json'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

export const useChains = () => {
  const { network } = useRecoilValue(walletState)

  return useMemo(
    () =>
      network === 'testnet' ? testnetChainInfo || [] : mainnetChainInfo || [],
    [network]
  )
}

export const useChainInfo = (id = null) => {
  const chainInfo: Array<any> = useChains()

  const chain = useMemo(() => {
    if (!chainInfo) {
      return []
    }

    return chainInfo.find(({ chainId }) => chainId === id) || chainInfo?.[0]
  }, [chainInfo, id])

  return [chain]
}
