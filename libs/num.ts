import BigNumber from 'bignumber.js'
import numeral from 'numeral'

const ONE_TOKEN = 1000000

BigNumber.config({
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-10, 20],
})

export const formatPrice = (amount, format = '0,0.00a') => numeral(amount).format(format).
  toUpperCase()

export const fromChainAmount = (value: BigNumber.Value = '0',
  decimal = 6): string => new BigNumber(value).div(10 ** decimal).
  toFixed(6)

export const toChainAmount = (value: BigNumber.Value = '0',
  decimal = 6): string => new BigNumber(value).times(10 ** decimal).
  toFixed(0)

export const toDecimal = (value: BigNumber.Value = '0', dp = 6): string => new BigNumber(value).toFixed(dp).
  toString()

export const toNumber = (value: BigNumber.Value = '0'): number => new BigNumber(value).toNumber()

export const num = (value: BigNumber.Value = '0'): BigNumber => new BigNumber(value)
