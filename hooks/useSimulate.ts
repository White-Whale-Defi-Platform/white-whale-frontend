import { useQuery } from 'react-query'
import { useEffect, useState } from 'react'
import { parseError } from '../util/parseError'
import { Wallet } from '../util/wallet-adapters'
import { EncodeObject } from '@cosmjs/proto-signing'

type Simulate = {
  msgs: EncodeObject[]
  signingClient: Wallet | undefined
  address: string | undefined
  connected: boolean
  amount: string
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
}

const useSimulate = ({ msgs, signingClient, address, connected, amount, onError, onSuccess }: Simulate) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  console.log({msgs})

  // clear error message when amount is changed
  useEffect(() => {
    if (amount === '' && !!errorMessage) setErrorMessage(null)
  }, [amount, errorMessage])

  const simulate = useQuery({
    queryKey: ['simulate', msgs, amount],
    queryFn: () => {
      if (!connected || Number(amount) <= 0 || !address || !signingClient || !msgs) return

      setErrorMessage(null)
      return signingClient?.simulate(address, msgs!, undefined)
    },
    onSuccess: (data) => {
      onSuccess?.(data)
    },
    onError: (error: Error) => {
      const message = parseError(error)
      setErrorMessage(message)
      onError?.(error)
    },
    enabled: msgs?.length > 0 && !!connected && Number(amount) > 0,
    retry: false,
  })

  return {
    ...simulate,
    errorMessage,
  }
}

export default useSimulate
