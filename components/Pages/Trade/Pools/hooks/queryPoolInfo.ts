import { getPoolInfo } from 'services/swap/index'

export const queryPoolInfo = async ({
  context: { cosmWasmClient },
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
