export const protectAgainstNaN = (value: number) => (isNaN(value) ? 0 : value)

export function convertMicroDenomToDenom(
  value: number | string,
  decimals: number
): number {
  if (decimals === 0) return Number(value)

  return protectAgainstNaN(Number(value) / Math.pow(10, decimals))
}

export function convertDenomToMicroDenom(
  value: number | string,
  decimals: number
): number {
  if (decimals === 0) return Number(value)

  return protectAgainstNaN(
    parseInt(String(Number(value) * Math.pow(10, decimals)), 10)
  )
}

export function convertFromMicroDenom(denom: string) {
  return denom?.substring(1).toUpperCase()
}

export function convertToFixedDecimals(value: number | string): string {
  const amount = Number(value)
  return amount > 0.01 ? amount.toFixed(2) : String(amount)
}

export const formatTokenName = (name: string) => {
  if (name) {
    return name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase()
  }
  return ''
}

export const calculateDurationString = (durationInMillis: number): string => {
  if (durationInMillis >= 86400000) {
    return `${Math.floor(durationInMillis / 86400000)} days`;
  } else if (durationInMillis >= 3600000) {
    return `${Math.floor(durationInMillis / 3600000)} hours`;
  } else if (durationInMillis >= 60000) {
    return `${Math.floor(durationInMillis / 60000)} minutes`;
  } else if (durationInMillis > 1000) {
    return `${Math.floor(durationInMillis / 1000)} seconds`;
  } else {
    return `imminent`;
  }
};
