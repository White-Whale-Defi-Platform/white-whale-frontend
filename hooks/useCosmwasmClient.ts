import { useQuery } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useChains } from 'hooks/useChainInfo'

export const useCosmwasmClient = (
  chainId?: string
): CosmWasmClient | undefined => {
  const chainInfo = useChains()

  const { data: client } = useQuery(
    ['cosmwasmClient', chainId],
    async () => {
      const chain = chainInfo.find((row) => row.chainId === chainId)
      return CosmWasmClient.connect(chain.rpc)
    },
    {
      enabled: Boolean(chainId),
    }
  )

  return client
}
