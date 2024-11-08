/**
 * General use validation function for when the user supplies a positive decimal value.
 * For example it is used with token and slippage amounts.
 * @param input The user supplied value
 * @returns Validated string that has invalid patterns removed
 */
export const amountInputValidation = (input: string): string => {
  const amount = input.
    // Limiting the number of characters to be 32
    slice(0, 32).
    // Disallowing leading decimal place and multiple zeros before decimal place
    replace(/^(?:\.|0{2,}\.)/u, '0.').
    // Eliminating multiple leading zeros before the numbers between 1-9
    replace(/^0+(?=[0-9])/u, '').
    // Remove excess zeros after decimal point
    replace(/\.(\d+?)0{2,}$/u, '.$10')
  // Ensuring multiple decimal points can't be used
  return input.indexOf('.') !== amount.lastIndexOf('.') ?
    amount.slice(0, amount.indexOf('.') + 1) + amount.slice(amount.indexOf('.')).replaceAll('.', '')
    : amount;
}
