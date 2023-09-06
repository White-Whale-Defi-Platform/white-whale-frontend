import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

export const fetchTotalPoolSupply = async (swapAddress: string,
  client: CosmWasmClient) => {
  if (!client || !swapAddress) {
    return null
  }
  const { total_share } = await client.queryContractSmart(swapAddress, {
    pool: {},
  })

  return Number(total_share)
}
