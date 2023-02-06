export const getTokenDecimal = (address: string) => {
  let tokenCGCId = 6

  switch (address) {
    case 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7':
      // raw
      tokenCGCId = 6
      break
    case 'inj':
      // raw
      tokenCGCId = 18
      break

    default:
      break
  }

  return tokenCGCId
}
