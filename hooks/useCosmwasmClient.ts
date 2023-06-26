import { useEffect, useState } from 'react'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useChains } from 'hooks/useChainInfo'

export const useCosmwasmClient = (chainId?: string): CosmWasmClient => {
  const chainInfo = useChains()
  const [client, setClient] = useState<any>({})

  useEffect(() => {
    const getClient = async () => {
      const chain = chainInfo.find((row) => row.chainId === chainId)
      const client = await CosmWasmClient.connect(chain?.rpc)

      if (!!client) setClient(client)
    }
    if (!!chainInfo && !!chainId) getClient()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainInfo, chainId])

  return client
}
