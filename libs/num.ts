import BigNumber from 'bignumber.js'
import numeral from 'numeral'

// import { ONE_TOKEN } from './constants'

const ONE_TOKEN = 1000000


BigNumber.config({
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-10, 20],
})

/**
 * Format Terra amount
 * @param value - string: amount from Terra blockchain
 * @param format - string: numeral format
 * @returns string
 */
// export const fromChainAmount = (
//   value: BigNumber.Value = '0',
//   format = '0,0.00a',
// ): string => {
//   const amount = new BigNumber(value).div(ONE_TOKEN).toNumber()
//   return numeral(amount).format(format).toString()
// }


export const formatPrice = (amount, format = '0,0.00a') => {
  return numeral(amount).format(format).toUpperCase()
}

export const fromChainAmount = (value: BigNumber.Value = '0'): string => {
  return new BigNumber(value).dp(6).div(ONE_TOKEN).toString()
}

export const toChainAmount = (value: BigNumber.Value = '0'): string => {
  return new BigNumber(value).dp(6).times(ONE_TOKEN).toString()
}

export const toDecimal = (
  value: BigNumber.Value = '0',
  dp: number = 6,
): string => {
  return new BigNumber(value).toFixed(dp).toString()
}

export const toNumber = (value: BigNumber.Value = '0'): number => {
  return new BigNumber(value).toNumber()
}

export const num = (value: BigNumber.Value = '0'): BigNumber => {
  return new BigNumber(value)
}



// import { isFinite, times } from "./math";
// import { decimal, toFixed } from "./parse";

// export const percentage = (value?: string, dp = 2): string =>
//   isFinite(value)
//     ? dp === -1
//       ? decimal(times(value, 100))
//       : toFixed(times(value, 100), dp)
//     : "";

// export const percent = (value?: string, dp = 2): string =>
//   isFinite(value) ? percentage(value, dp) + "%" : "";
