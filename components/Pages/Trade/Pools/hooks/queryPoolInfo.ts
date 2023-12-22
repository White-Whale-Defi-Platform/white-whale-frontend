import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

export type PoolInfoResponse = {
  total_share: string
  lp_token_address: string
  assets: any
}
const getPoolInfo = async (swapAddress: string,
  client: CosmWasmClient): Promise<PoolInfoResponse> => {
  if (!swapAddress || !client) {
    return null
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
