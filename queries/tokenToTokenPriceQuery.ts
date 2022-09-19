import { tokenDollarValueQuery } from 'queries/tokenDollarValueQuery'

import {
  getToken1ForToken2Price,
  getToken2ForToken1Price,
  getTokenForTokenPrice,
} from '../services/swap'
import {
  convertDenomToMicroDenom,
  convertMicroDenomToDenom,
} from '../util/conversion'
import {Wallet} from "../util/wallet-adapters";
import { TokenInfo } from './usePoolsListQuery'
import { PoolMatchForSwap } from './useQueryMatchingPoolForSwap'

type TokenToTokenPriceQueryArgs = {
  matchingPools: PoolMatchForSwap
  tokenA: TokenInfo
  tokenB: TokenInfo
  amount: number
  client: Wallet
  id?: string
}

export async function tokenToTokenPriceQueryWithPools({
  matchingPools,
  tokenA,
  tokenB,
  amount,
  client,
  id
}: TokenToTokenPriceQueryArgs): Promise<number | undefined> {
  if (tokenA.symbol === tokenB.symbol) {
    return 1
  }

  const formatPrice = (price) =>
    convertMicroDenomToDenom(price, tokenB.decimals)

  const convertedTokenAmount = convertDenomToMicroDenom(amount, tokenA.decimals)

  const { streamlinePoolAB, streamlinePoolBA, baseTokenAPool, baseTokenBPool } =
    matchingPools

  if (id) {
    const [price] = await tokenDollarValueQuery([id])
    return price
  }

  if (streamlinePoolAB) {
    return await getToken1ForToken2Price({
      nativeAmount: convertedTokenAmount,
      swapAddress: streamlinePoolAB.swap_address,
      client
    })
  }

  if (streamlinePoolBA) {
    return await getToken2ForToken1Price({
      tokenAmount: convertedTokenAmount,
      swapAddress: streamlinePoolBA.swap_address,
      client,
    })
  }

  return await formatPrice(getTokenForTokenPrice({
    tokenAmount: convertedTokenAmount,
    swapAddress: baseTokenAPool.swap_address,
    outputSwapAddress: baseTokenBPool.swap_address,
    client,
  })
  )
}

export async function tokenToTokenPriceQuery({
  baseToken,
  fromTokenInfo,
  toTokenInfo,
  amount,
  client,
}): Promise<number | undefined> {
  const formatPrice = (price) =>
    convertMicroDenomToDenom(price, toTokenInfo.decimals)

  const convertedTokenAmount = convertDenomToMicroDenom(
    amount,
    fromTokenInfo.decimals
  )

  if (fromTokenInfo.symbol === toTokenInfo.symbol) {
    return 1
  }

  const shouldQueryBaseTokenForTokenB =
    fromTokenInfo.symbol === baseToken.symbol && toTokenInfo.swap_address


  const shouldQueryTokenBForBaseToken =
    toTokenInfo.symbol === baseToken.symbol && fromTokenInfo.swap_address

  console.log({ shouldQueryBaseTokenForTokenB, shouldQueryTokenBForBaseToken })

  if (shouldQueryBaseTokenForTokenB) {
    const resp = await getToken1ForToken2Price({
      nativeAmount: convertedTokenAmount,
      swapAddress: toTokenInfo.swap_address,
      client,
    })

    return formatPrice(resp)
  } else if (shouldQueryTokenBForBaseToken) {
    return await getToken2ForToken1Price({
      tokenAmount: convertedTokenAmount,
      swapAddress: fromTokenInfo.swap_address,
      client,
    })
  }

  return await getTokenForTokenPrice({
    tokenAmount: convertedTokenAmount,
    swapAddress: fromTokenInfo.swap_address,
    outputSwapAddress: toTokenInfo.swap_address,
    client,
  })
}
