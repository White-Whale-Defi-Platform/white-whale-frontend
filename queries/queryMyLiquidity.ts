import { isNativeToken } from 'services/asset'

import { queryLiquidityBalance } from '../services/liquidity'
import { protectAgainstNaN } from '../util/conversion'

export async function queryMyLiquidity({
  swap,
  address,
  context: { cosmWasmClient },
  totalLockedLp,
  myLockedLp,
}) {
  const isNative = isNativeToken(swap.lp_token)
  const myNotLockedLp = address
    ? await queryLiquidityBalance({
        tokenAddress: swap.lp_token,
        cosmWasmClient,
        address,
        isNative,
      })
    : 0

  /* provide dollar value for reserves as well */
  const totalAssets: [number, number] = [
    protectAgainstNaN(swap.token1_reserve),
    protectAgainstNaN(swap.token2_reserve),
  ]

  const myNotLockedAssets: [number, number] = [
    protectAgainstNaN(totalAssets[0] * (myNotLockedLp / swap.lp_token_supply)),
    protectAgainstNaN(totalAssets[1] * (myNotLockedLp / swap.lp_token_supply)),
  ]
  const totalLockedAssets: [number, number] = [
    protectAgainstNaN(totalAssets[0] * (totalLockedLp / swap.lp_token_supply)),
    protectAgainstNaN(totalAssets[1] * (totalLockedLp / swap.lp_token_supply)),
  ]

  const myLockedAssets: [number, number] = [
    protectAgainstNaN(totalAssets[0] * (myLockedLp / swap.lp_token_supply)),
    protectAgainstNaN(totalAssets[1] * (myLockedLp / swap.lp_token_supply)),
  ]

  return {
    totalAssets,
    myNotLockedAssets,
    myLockedAssets,
    totalLockedAssets,
    myNotLockedLp,
  }
}
