import { useMemo } from 'react'
import { useQuery } from 'react-query'

import useDebounceValue from 'hooks/useDebounceValue'

export type Simulated = {
  amount: string
  spread: string
  commission: string
  price: number
  error?: string
}

const simulate = async ({ cosmWasmClient, msg, routerAddress }): Promise<any> => await cosmWasmClient?.queryContractSmart(routerAddress, msg)

const useSimulate = ({ cosmWasmClient, msg, routerAddress }) => {
  const debounseMsg = useDebounceValue(msg, 300)
  const { data, isLoading, error } = useQuery<any>(
    ['simulation', debounseMsg],
    async () => {
      if (!msg) {
        return null
      }
      return simulate({ cosmWasmClient,
        msg: debounseMsg,
        routerAddress })
    },
    {
      enabled: Boolean(cosmWasmClient) && Boolean(msg) && Boolean(debounseMsg),
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
