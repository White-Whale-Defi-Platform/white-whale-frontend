import { useCallback, useMemo } from 'react'

import { TokenInfo } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'

import { useTokenList } from './useTokenList'

export const getTokenInfoFromTokenList = (tokenSymbol: string,
  tokensList: Array<TokenInfo>): TokenInfo | undefined => tokensList?.find((x) => x.symbol === tokenSymbol)
/* /token selector functions */

/* Returns a selector for getting multiple tokens info at once */
export const useGetMultipleTokenInfo = () => {
  const [tokenList] = useTokenList()
  return useCallback((tokenSymbols: Array<string>) => tokenSymbols?.map((tokenSymbol) => getTokenInfoFromTokenList(tokenSymbol, tokenList?.tokens)),
    [tokenList])
}

/* Hook for token info retrieval based on multiple `tokenSymbol` */
export const useMultipleTokenInfo = (tokenSymbols: Array<string>) => {
  const getMultipleTokenInfo = useGetMultipleTokenInfo()
  return useMemo(() => getMultipleTokenInfo(tokenSymbols),
    [tokenSymbols, getMultipleTokenInfo])
}

/* Hook for token info retrieval based on `tokenSymbol` */
export const useTokenInfo = (tokenSymbol: string) => useMultipleTokenInfo(useMemo(() => [tokenSymbol], [tokenSymbol]))?.[0]

/* Hook for base token info retrieval */
export const useBaseTokenInfo = () => {
  const [tokenList] = useTokenList()
  return useMemo(() => tokenList?.baseToken, [tokenList])
}
