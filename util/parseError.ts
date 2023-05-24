export const parseError = (error: Error) => {
  const customErrors = [
    { regex: /insufficient funds/i, message: 'Insufficient funds' },
    { regex: /overflow: cannot sub with/i, message: 'Insufficient funds' },
    { regex: /max spread assertion/i, message: 'Try increasing slippage' },
    { regex: /request rejected/i, message: 'User denied' },
  ]

  const errorMessage = error?.message || ''

  const matchedError = customErrors.find(({ regex }) => regex.test(errorMessage))
  return matchedError ? matchedError.message : 'Something went wrong, please try again'
}
