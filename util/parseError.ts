export const parseError = (error: Error) => {
  const customErrors = [
    { regex: /insufficient funds/u,
      message: 'Insufficient funds' },
    { regex: /overflow: cannot sub with/u,
      message: 'Insufficient funds' },
    { regex: /max spread assertion/u,
      message: 'Try increasing slippage' },
    { regex: /request rejected/u,
      message: 'User denied' },
    {
      regex: /which exceeds the maximum of 3 flows allowed/u,
      message: 'Exceeds maximum allowed flows',
    },
    {
      regex: /Flow start timestamp is too far into the future/u,
      message: 'Start date is too far in future',
    },
  ]

  return (
    customErrors.find(({ regex }) => regex.test(error?.message || ''))?.
      message || 'Failed to execute transaction'
  )
}
