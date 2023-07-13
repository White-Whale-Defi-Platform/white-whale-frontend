export function formatSdkErrorMessage(e) {
  const strError = String(e)
  return strError.length > 300
    ? `${strError.substring(0, 150)} ... ${strError.substring(
        strError.length - 150
      )}`
    : strError
}
