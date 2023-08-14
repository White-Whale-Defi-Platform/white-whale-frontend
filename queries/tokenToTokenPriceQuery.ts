import { tokenDollarValueQuery } from 'queries/tokenDollarValueQuery'
import {
  getToken1ForToken2Price,
  getToken2ForToken1Price,
  getTokenForTokenPrice,
} from 'services/swap'
import { convertDenomToMicroDenom } from 'util/conversion'

import { TokenInfo } from './usePoolsListQuery'
import { PoolMatchForSwap } from './useQueryMatchingPoolForSwap'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

type TokenToTokenPriceQueryArgs = {
  matchingPools: PoolMatchForSwap
  tokenA: TokenInfo
  tokenB: TokenInfo
  amount: number
  cosmWasmClient: CosmWasmClient
  id?: string
}

export async function tokenToTokenPriceQueryWithPools({
  matchingPools,
  tokenA,
  tokenB,
  amount,
  cosmWasmClient,
  id,
}: TokenToTokenPriceQueryArgs): Promise<number | undefined> {
  if (tokenA?.symbol === tokenB?.symbol) {
    return 1
  }

  if (!cosmWasmClient) {
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
      cosmWasmClient,
    })
  }

  if (streamlinePoolBA) {
    return getToken2ForToken1Price({
      swapAddress: streamlinePoolBA.swap_address,
      cosmWasmClient,
    })
  }

  // Return formatPrice(
  return getTokenForTokenPrice({
    tokenAmount: convertedTokenAmount,
    swapAddress: baseTokenAPool.swap_address,
    outputSwapAddress: baseTokenBPool.swap_address,
    cosmWasmClient,
  })
  // )
}
