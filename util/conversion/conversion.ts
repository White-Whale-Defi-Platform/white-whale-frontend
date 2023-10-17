export const toBase64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64')

export const protectAgainstNaN = (value: number) => (isNaN(value) ? 0 : value)

export const convertMicroDenomToDenom = (value: number | string,
  decimals: number): number => {
  if (decimals === 0) {
    return Number(value)
  }

  return protectAgainstNaN(Number(value) / (10 ** decimals))
}

export const convertDenomToMicroDenom = (value: number | string,
  decimals: number): number => {
  if (decimals === 0) {
    return Number(value)
  }

  return protectAgainstNaN(parseInt(String(Number(value) * (10 ** decimals)), 10))
}
