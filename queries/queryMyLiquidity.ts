import { AMP_WHALE_TOKEN_SYMBOL, B_WHALE_TOKEN_SYMBOL, WHALE_TOKEN_SYMBOL } from 'constants/index'
import { isNativeToken } from 'services/asset'

import { queryLiquidityBalance } from '../services/liquidity'
import { convertMicroDenomToDenom, protectAgainstNaN } from '../util/conversion'

export const queryMyLiquidity = async ({
  swap,
  address,
  context: { cosmWasmClient },
  totalLockedLp,
  myLockedLp,
  prices,
}) => {
  if (!prices) {
    return {}
  }

  const tokenASymbol = swap.assetOrder[0] === AMP_WHALE_TOKEN_SYMBOL || swap.assetOrder[0] === B_WHALE_TOKEN_SYMBOL ? WHALE_TOKEN_SYMBOL : swap.assetOrder[0]
  const tokenADecimals = swap.pool_assets?.[0]?.decimals
  const tokenBSymbol = swap.assetOrder[1] === AMP_WHALE_TOKEN_SYMBOL || swap.assetOrder[1] === B_WHALE_TOKEN_SYMBOL ? WHALE_TOKEN_SYMBOL : swap.assetOrder[1]
  const tokenBDecimals = swap.pool_assets?.[1]?.decimals
  const isNative = isNativeToken(swap.lp_token)
  const myNotLockedLp = address
    ? await queryLiquidityBalance({
      tokenAddress: swap.lp_token,
      cosmWasmClient,
      address,
      isNative,
    })
    : 0

  const totalAssets: [number, number] = [
    protectAgainstNaN(swap.token1_reserve),
    protectAgainstNaN(swap.token2_reserve),
  ]
  const totalAssetsInDollar: [number, number] = [
    convertMicroDenomToDenom(protectAgainstNaN(swap.token1_reserve), tokenADecimals) * (prices?.[tokenASymbol] || 0),
    convertMicroDenomToDenom(protectAgainstNaN(swap.token2_reserve), tokenBDecimals) * (prices?.[tokenBSymbol] || 0),
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
    totalAssetsInDollar: (totalAssetsInDollar[0] + totalAssetsInDollar[1]),
    ratioFromPool: convertMicroDenomToDenom(swap.token2_reserve, tokenBDecimals) / convertMicroDenomToDenom(swap.token1_reserve, tokenADecimals),
    myNotLockedAssets,
    myLockedAssets,
    totalLockedAssets,
    myNotLockedLp,
  }
}
