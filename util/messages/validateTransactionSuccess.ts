export const validateTransactionSuccess = (result: any) => {
  if (result.code) {
    throw new Error(`Error when broadcasting tx ${result.transactionHash} at height ${result.height}. Code: ${result.code}; Raw log: ${result.rawLog}`)
  }

  return result
}
