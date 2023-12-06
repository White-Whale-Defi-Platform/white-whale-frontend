import { useQuery } from 'react-query'

import { TokenInfo } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { useQueryMatchingPoolForSwap } from 'components/Pages/Trade/Pools/hooks/useQueryMatchingPoolForSwap'
import { DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL } from 'constants/index'
import { useClients } from 'hooks/useClients'
import { useTokenInfo } from 'hooks/useTokenInfo'
import { tokenToTokenPriceQueryWithPools } from 'queries/tokenToTokenPriceQuery'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

type UseTokenPairsPricesArgs = {
  tokenASymbol: TokenInfo['symbol']
  tokenBSymbol: TokenInfo['symbol']
  tokenAmount: number
  enabled?: boolean
  refetchInBackground?: boolean
}

export const useTokenToTokenPriceQuery = ({
  tokenAmount,
  tokenASymbol,
  tokenBSymbol,
  enabled = true,
  refetchInBackground,
}: UseTokenPairsPricesArgs) => {
  const { walletChainName } = useRecoilValue(chainState)

  const { cosmWasmClient } = useClients(walletChainName)

  const tokenA = useTokenInfo(tokenASymbol)
  const tokenB = useTokenInfo(tokenBSymbol)

  const [matchingPools] = useQueryMatchingPoolForSwap({ tokenA,
    tokenB })

  return useQuery({
    queryKey: [
      `tokenToTokenPrice/${tokenBSymbol}/${tokenASymbol}/${tokenAmount}`,
      tokenAmount,
    ],
    queryFn() {
      if (tokenA && tokenB && matchingPools) {
        return tokenToTokenPriceQueryWithPools({
          matchingPools,
          tokenA,
          tokenB,
          cosmWasmClient,
          amount: tokenAmount,
        })
      } else {
        return null
      }
    },
    enabled: Boolean(enabled &&
        cosmWasmClient &&
        matchingPools &&
        tokenA &&
        tokenB &&
        tokenAmount > 0 &&
        tokenBSymbol !== tokenASymbol),
    refetchOnMount: 'always' as const,
    refetchInterval: refetchInBackground
      ? DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL
      : null,
    refetchIntervalInBackground: Boolean(refetchInBackground),
  })
}

export const useTokenToTokenPrice = (args: UseTokenPairsPricesArgs) => {
  const { data, isLoading } = useTokenToTokenPriceQuery(args)
  return [data, isLoading] as const
}
