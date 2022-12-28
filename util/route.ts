export const getPathName = (pathname, newChainLabel) => {
  return pathname.includes('[chainId')
    ? pathname.replace('[chainId]', newChainLabel.toLowerCase())
    : `/${newChainLabel.toLowerCase()}/${pathname}`
}
