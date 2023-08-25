import { useMemo } from 'react'
import { useQuery } from 'react-query'

import useDebounceValue from 'hooks/useDebounceValue'
import { Wallet } from 'util/wallet-adapters'

type QuerySimulate = {
  client: Wallet
  token: string
  isNative: boolean
  amount: string
  reverse: boolean
  swapAddress: string
}

type SwapSimulate = {
  client: Wallet
  token: string
  isNative: boolean
  amount: string
  reverse: boolean
  swapAddress: string
  enabled: boolean
}

export type Simulated = {
  amount: string
  spread: string
  commission: string
  price: number
  error?: string
}

const simulate = ({ client, msg, routerAddress }): Promise<any> => client?.queryContractSmart(routerAddress, msg)

const useSimulate = ({ client, msg, routerAddress }) => {
  const debounseMsg = useDebounceValue(msg, 300)

  const { data, isLoading, error } = useQuery<any>(
    ['simulation', debounseMsg],
    () => {
      if (msg == null) {
        return
      }

      return simulate({ client,
        msg: debounseMsg,
        routerAddress })
    },
    {
      enabled: Boolean(client) && Boolean(msg) && Boolean(debounseMsg),
      /*
       * OnError: (err) => {
       *     console.log({err : (err as any)?.code})
       * }
       */
    },
  )

  const simulatedError = useMemo(() => {
    if (!error) {
      return null
    }

    if ((/Operation disabled, swap/i).test(error?.toString())) {
      return 'Pair is disabled for swap'
    } else if (
      (/unreachable: query wasm contract failed: invalid request/i).test(error?.toString()) ||
      (/codespace: wasm, code: 9: query wasm/i).test(error?.toString())
    ) {
      return 'Insufficient liquidity'
    }
    return null
  }, [error])

  return {
    simulated: data,
    error: simulatedError,
    isLoading,
  }
}

export default useSimulate
