import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { getPoolFromAPI } from 'services/useAPI'

export type PoolInfoResponse = {
  total_share: string
  lp_token_address: string
  assets: any
}
export const getPoolInfo = async (swapAddress: string,
  client: CosmWasmClient): Promise<PoolInfoResponse> => {
  if (!swapAddress || !client) {
    return null
  }
  const apiValues = await getPoolFromAPI(await client.getChainId(), swapAddress)
  if (apiValues) {
    return apiValues
  }
  return await client.queryContractSmart(swapAddress, {
    pool: {},
  })
}
export const queryPoolInfo = async ({
  cosmWasmClient,
  swap_address,
}) => {
  const poolInfo = await getPoolInfo(swap_address, cosmWasmClient)
  const [asset1, asset2] = poolInfo?.assets || []

  return {
    ...poolInfo,
    swap_address,
    token1_reserve: Number(asset1?.amount),
    token2_reserve: Number(asset2?.amount),
    lp_token_supply: Number(poolInfo?.total_share),
  }
}
