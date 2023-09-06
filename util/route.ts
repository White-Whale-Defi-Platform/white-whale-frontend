export const getPathName = ({ pathname }, newChainLabel: string) => (pathname.includes('[chainId')
  ? pathname.replace('[chainId]', newChainLabel.toLowerCase())
  : `/${newChainLabel.toLowerCase()}${pathname}`)
