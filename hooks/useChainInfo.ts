const chainInfoQueryKey = '@chain-info'
// import chainInfo from "components/Wallet/chainInfo.json"
import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { ChainInfo } from '@keplr-wallet/types'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import { queryClient } from '../services/queryClient'

interface CustomChainType extends ChainInfo {
  label: string
}

export const unsafelyReadChainInfoCache = () =>
  queryClient.getQueryCache().find(chainInfoQueryKey)?.state?.data as
    | ChainInfo
    | undefined

export const useChains = () => {
  const currentWalletState = useRecoilValue(walletState)

  const { data = [], isLoading } = useQuery<CustomChainType[]>(
    ['chainInfo', currentWalletState.network],
    async () => {
      const url = `/${currentWalletState.network}${process.env.NEXT_PUBLIC_CHAIN_INFO_URL}`
      const response = await fetch(url)

      return response.json()
    },
    {
      enabled: !!currentWalletState.network,
      onError(e) {
        console.error('111Error loading chain info:', e)
      },
    }
  )

  return data || []
}

export const useChainInfo = (id = null) => {
  const chainInfo = useChains()

  const chain = useMemo(() => {
    if (!chainInfo) return []

    return chainInfo.find(({ chainId }) => chainId === id) || chainInfo?.[0]
  }, [chainInfo, id])

  return [chain]
}
