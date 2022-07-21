import { ChainInfo } from '@keplr-wallet/types'
import { useQuery } from 'react-query'

import { queryClient } from '../services/queryClient'

const chainInfoQueryKey = '@chain-info'
import chainInfo from "components/Wallet/chainInfo.json"


export const unsafelyReadChainInfoCache = () =>
  queryClient.getQueryCache().find(chainInfoQueryKey)?.state?.data as
    | ChainInfo
    | undefined 

export const useChains = () => chainInfo

export const useChainInfo = (id = "uni-3") => {
  const { data, isLoading } = useQuery<ChainInfo>(
    id,
    async () => {
      // const response = await fetch(process.env.NEXT_PUBLIC_CHAIN_INFO_URL)
      // return await response.json()
     return chainInfo.find(({chainId}) => chainId === id)
    },
    {
      onError(e) {
        console.error('Error loading chain info:', e)
      },
    }
  )

  return [data, isLoading] as const
}
