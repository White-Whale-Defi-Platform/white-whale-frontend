export const parseLiquidity = (liqString: string) => {
  const value = parseFloat(liqString?.replace(/[^\d.-]/gu, ''))
  /*
   * We do this mutation because by now we already have modified the string to include a letter abbreviation
   * if the liquidity goes over 1000
   * If it's in the thousands, multiply the value by 1000, if millions 1000000
   */
  return liqString?.toUpperCase().includes('K')
    ? value * 1_000
    : liqString?.toUpperCase().includes('M')
      ? value * 1_000_000
      : value
}

export const aggregateAndSortTaxAmounts = (amounts: { denom: string, amount: string }[]) => amounts.reduce((acc, cur) => {
  const existingAmount = acc.find((a) => a.denom === cur.denom);
  if (existingAmount) {
    existingAmount.amount = (parseFloat(existingAmount.amount) + parseFloat(cur.amount)).toString();
  } else {
    acc.push(cur);
  }
  return acc;
}, [] as { denom: string, amount: string }[]).sort((a, b) => a.denom.localeCompare(b.denom));

export const lastClaimed = (daysSinceLastClaim: number) => {
  if (daysSinceLastClaim >= 21) {
    return '21+ days ago'
  } else if (daysSinceLastClaim === 0) {
    return 'Today'
  }
  const multiple = daysSinceLastClaim === 1 ? '' : 's'
  return `${daysSinceLastClaim} day${multiple} ago`
}
