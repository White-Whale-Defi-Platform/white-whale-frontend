import { tokenDollarValueQuery } from 'queries/tokenDollarValueQuery'
import {
  getToken1ForToken2Price,
  getToken2ForToken1Price,
  getTokenForTokenPrice,
} from 'services/swap'
import { convertDenomToMicroDenom } from 'util/conversion'

import { TokenInfo } from './usePoolsListQuery'
import { PoolMatchForSwap } from './useQueryMatchingPoolForSwap'

type TokenToTokenPriceQueryArgs = {
  matchingPools: PoolMatchForSwap
  tokenA: TokenInfo
  tokenB: TokenInfo
  amount: number
  client: any
  id?: string
}

export async function tokenToTokenPriceQueryWithPools({
  matchingPools,
  tokenA,
  tokenB,
  amount,
  client,
  id,
}: TokenToTokenPriceQueryArgs): Promise<number | undefined> {
  if (tokenA?.symbol === tokenB?.symbol) {
    return 1
  }

  if (!client) {
    return
  }

  const convertedTokenAmount = convertDenomToMicroDenom(amount, tokenA.decimals)

  const { streamlinePoolAB, streamlinePoolBA, baseTokenAPool, baseTokenBPool } =
    matchingPools || {}

  if (id) {
    const [price] = await tokenDollarValueQuery([id])
    return price
  }

  if (streamlinePoolAB) {
    return getToken1ForToken2Price({
      swapAddress: streamlinePoolAB.swap_address,
      client,
    })
  }

  if (streamlinePoolBA) {
    return getToken2ForToken1Price({
      swapAddress: streamlinePoolBA.swap_address,
      client,
    })
  }

  // return formatPrice(
  return getTokenForTokenPrice({
    tokenAmount: convertedTokenAmount,
    swapAddress: baseTokenAPool.swap_address,
    outputSwapAddress: baseTokenBPool.swap_address,
    client,
  })
  // )
}
