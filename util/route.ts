export const getPathName = (router, newChainLabel) =>
  router.pathname.includes('[chainId')
    ? router.pathname.replace('[chainId]', newChainLabel.toLowerCase())
    : `/${newChainLabel.toLowerCase()}${router.pathname}`
