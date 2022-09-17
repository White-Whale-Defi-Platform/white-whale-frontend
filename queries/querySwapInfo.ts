import { getSwapInfo } from '../services/swap'

export async function querySwapInfo({ context: { client }, swap_address }) {

  const swap = await getSwapInfo(swap_address, client)
  const [asset1, asset2] = swap?.assets || []
  return {
    ...swap,
    swap_address,
    token1_reserve: Number(asset1?.amount),
    token2_reserve: Number(asset2?.amount),
    lp_token_supply: Number(swap?.total_share),
  }
}
