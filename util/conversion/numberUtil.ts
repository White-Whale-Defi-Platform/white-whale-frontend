export const aggregateAndSortTaxAmounts = (amounts: { denom: string, amount: string }[]) => amounts.reduce((acc, cur) => {
  const existingAmount = acc.find((a) => a.denom === cur.denom);
  if (existingAmount) {
    existingAmount.amount = (parseFloat(existingAmount.amount) + parseFloat(cur.amount)).toString();
  } else {
    acc.push(cur);
  }
  return acc;
}, [] as { denom: string, amount: string }[]).sort((a, b) => a.denom.localeCompare(b.denom));

export const lastClaimed = (latestEpochStartDate: number) => {
  let days = Math.ceil((Date.now() - latestEpochStartDate) / 86400000)
  if (latestEpochStartDate === 0) {
    days = 0
  }
  if (days >= 21) {
    return '21+ days ago'
  } else if (days === 0) {
    return 'Today'
  }
  const multiple = days === 1 ? '' : 's'
  return `${days} day${multiple} ago`
}
