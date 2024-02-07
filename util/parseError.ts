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
      regex: /flow start timestamp is too far into the future/u,
      message: 'Start date is too far in future',
    },
    {
      regex: /account sequence mismatch/u,
      message: 'You have pending transaction',
    },
    {
      regex: /out of gas/u,
      message: 'Out of gas, try increasing gas limit on wallet.',
    },
    {
      regex: /before the new\/latest epoch/u,
      message: 'Epoch not yet created.',
    },
    {
      regex: /there are unclaimed rewards available./u,
      message: 'There are unclaimed rewards available. Claim first.',
    },
    {
      regex: /pending rewards to be claimed before you can execute this action/u,
      message: 'There are unclaimed rewards available. Claim first.',
    },
  ]

  return (
    customErrors.find(({ regex }) => regex.test(error?.message.toLowerCase() || ''))?.
      message || 'Failed to execute transaction'
  )
}
