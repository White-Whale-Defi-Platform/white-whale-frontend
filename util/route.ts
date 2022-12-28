export const getPathName = (router, newChainLabel) => {
  const pathname = router.pathname

  return pathname.includes('[chainId')
    ? pathname.replace('[chainId]', newChainLabel.toLowerCase())
    : `/${newChainLabel.toLowerCase()}/${pathname}`

  // const paths = router.asPath.split('/')
  // return !paths[2]
  //   ? `/${newChainLabel.toLowerCase()}/${paths[1]}`
  //   : `/${newChainLabel.toLowerCase()}/${paths[2]}`
}
