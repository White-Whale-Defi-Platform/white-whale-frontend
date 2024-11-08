/**
 * General use validation function for when the user supplies a positive decimal value.
 * For example it is used with token and slippage amounts.
 * @param input The user supplied value
 * @param decimals Optional number of decimals to respect
 * @returns Validated string that has invalid patterns removed
 */
export const amountInputValidation = (input: string, decimals?: number): string => {
  let amount = input.
    slice(0, 32).
    replace(/^(?:\.|0{2,}\.)/u, '0.').
    replace(/^0+(?=[0-9])/u, '')

  // Handle multiple decimal points
  if (input.indexOf('.') !== amount.lastIndexOf('.')) {
    amount = amount.slice(0, amount.indexOf('.') + 1) +
      amount.slice(amount.indexOf('.')).replaceAll('.', '')
  }

  // If decimals is specified, just limit decimal places without padding
  if (decimals !== undefined && amount.includes('.')) {
    const [whole, fraction] = amount.split('.')
    amount = `${whole}.${fraction.slice(0, decimals)}`
  }

  return amount
}
