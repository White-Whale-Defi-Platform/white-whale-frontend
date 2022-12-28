export const getPathName = (router, newChainLabel) => {
  const paths = router.asPath.split('/')

  return !paths[2]
    ? `/${newChainLabel.toLowerCase()}/${paths[1]}`
    : `/${newChainLabel.toLowerCase()}/${paths[2]}`
}
