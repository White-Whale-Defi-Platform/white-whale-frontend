export const parseError = (error: Error) => {
  const customErrors = [
    { regex: /insufficient funds/i,
      message: 'Insufficient funds' },
    { regex: /overflow: cannot sub with/i,
      message: 'Insufficient funds' },
    { regex: /max spread assertion/i,
      message: 'Try increasing slippage' },
    { regex: /request rejected/i,
      message: 'User denied' },
    {
      regex: /which exceeds the maximum of 3 flows allowed/i,
      message: 'Exceeds maximum allowed flows',
    },
    {
      regex: /Flow start timestamp is too far into the future/i,
      message: 'Start date is too far in future',
    },
  ]

  return (
    customErrors.find(({ regex }) => regex.test(error?.message || ''))?.
      message || 'Failed to execute transaction'
  )
}
