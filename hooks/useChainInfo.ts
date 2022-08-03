import { ChainInfo } from '@keplr-wallet/types'
import { useQuery } from 'react-query'

import { queryClient } from '../services/queryClient'

const chainInfoQueryKey = '@chain-info'
// import chainInfo from "components/Wallet/chainInfo.json"
import { networkAtom } from 'state/atoms/walletAtoms'
import { useRecoilValue } from 'recoil'


export const unsafelyReadChainInfoCache = () =>
  queryClient.getQueryCache().find(chainInfoQueryKey)?.state?.data as
  | ChainInfo
  | undefined

export const useChains = () => {
  const network = useRecoilValue(networkAtom)

  const { data = [], isLoading } = useQuery<ChainInfo[]>(
    ['chainInfo', network],
    async () => {
      const url = `/${network}${process.env.NEXT_PUBLIC_CHAIN_INFO_URL}`
      const response = await fetch(url)
      return await response.json()
    },
    {
      enabled: !!network,
      onError(e) {
        console.error('Error loading chain info:', e)
      },
    }
  )

  return data || []
}

export const useChainInfo = (id = "uni-3") => {

  const chainInfo = useChains()

  const chain = chainInfo.find(({ chainId }) => chainId === id)

  return [chain]

  // const network = useRecoilValue(networkAtom)

  // const { data, isLoading } = useQuery<ChainInfo>(
  //   id,
  //   async () => {

  //     const url = `/${network}${process.env.NEXT_PUBLIC_CHAIN_INFO_URL}`
  //     // console.log({url})
  //     const response = await fetch(url)
  //     const chainInof = await response.json()
  //     return chainInfo.find(({ chainId }) => chainId === id)
  //   },
  //   {
  //     onError(e) {
  //       console.error('Error loading chain info:', e)
  //     },
  //   }
  // )

  // return [data, isLoading] as const
}
