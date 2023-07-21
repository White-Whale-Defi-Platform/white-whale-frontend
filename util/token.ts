export const getTokenDecimal = (address: string) => {
  const tokenDecimalMap = {
    peggy0xdAC17F958D2ee523a2206206994597C13D831ec7: 6,
    inj: 18,
  }

  return tokenDecimalMap[address] || 6
}
