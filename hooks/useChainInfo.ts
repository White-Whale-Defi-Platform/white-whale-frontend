import { useMemo } from 'react'

import mainnetChainInfo from 'public/mainnet/chain_info.json'
import testnetChainInfo from 'public/testnet/chain_info.json'
import { useRecoilValue } from 'recoil'
import { NetworkType, chainState } from 'state/chainState'

export const useChainInfos = () => {
  const { network } = useRecoilValue(chainState)

  return useMemo(() => {
    const chainInfo = network === NetworkType.testnet
      ? testnetChainInfo || []
      : mainnetChainInfo || []
    const out = []
    chainInfo.map((chain) => {
      if (!chain?.deactivated) {
        out.push(chain)
      }
    })
    return out
  },
  [network])
}

export const useChainInfo = (id = null) => {
  const chainInfo: Array<any> = useChainInfos()
  const chain = useMemo(() => {
    if (!chainInfo) {
      return []
    }

    return chainInfo.find(({ chainId }) => chainId === id) || chainInfo?.[0]
  }, [chainInfo, id])

  return [chain]
}
