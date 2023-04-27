import { useEffect, useState } from 'react'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useChains } from 'hooks/useChainInfo'

export const useCosmwasmClient = (chainId?: string): CosmWasmClient => {
  const chainInfo = useChains()
  const [clients, setClients] = useState<any>({})

  const getClients = async () => {
    const clientList = {}
    await Promise.all(
      chainInfo.map(async (row) => {
        clientList[row.chainId] = await CosmWasmClient.connect(row.rpc)
      })
    )

    if (Object.keys(clientList).length > 0) setClients(clientList)
  }

  useEffect(() => {
    getClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainInfo])

  return clients[chainId]
}
