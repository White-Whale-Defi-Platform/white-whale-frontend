import { POOL_TOKENS_DECIMALS } from 'constants/settings'
import { convertMicroDenomToDenom } from './conversion'

export const calcPoolTokenValue = ({
  tokenAmountInMicroDenom,
  tokenSupply,
  tokenReserves,
  tokenDecimals = POOL_TOKENS_DECIMALS,
}) => {
  return convertMicroDenomToDenom(
    (tokenAmountInMicroDenom / tokenSupply) * tokenReserves,
    tokenDecimals
  )
}

export const calcPoolTokenDollarValue = ({
  tokenAmountInMicroDenom,
  tokenSupply,
  tokenReserves,
  tokenDollarPrice,
  tokenDecimals,
}) => {
  return (
    calcPoolTokenValue({
      tokenAmountInMicroDenom,
      tokenSupply,
      tokenReserves,
      tokenDecimals,
    }) *
    tokenDollarPrice *
    2
  )
}
