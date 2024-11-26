import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { useChain } from '@cosmos-kit/react-lite'
import { useConfig } from 'components/Pages/Bonding/hooks/useDashboardData'
import { DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL } from 'constants/index'
import { useClients } from 'hooks/useClients'
import { useRecoilValue } from 'recoil'
import { CW20 } from 'services/cw20'
import { chainState } from 'state/chainState'
import { convertMicroDenomToDenom } from 'util/conversion'

import { useIBCAssetInfo } from './useIBCAssetInfo'
import { getTokenInfoFromTokenList, useTokenInfo } from './useTokenInfo'
import { useTokenList } from './useTokenList'

const fetchTokenBalance = async ({
  cosmWasmClient,
  signingClient,
  token = {},
  address,
}: {
  cosmWasmClient: CosmWasmClient
  signingClient: SigningCosmWasmClient
  token: any
  address: string
}) => {
  const { denom, native, token_address: tokenAddress, decimals } = token || {}

  if (!denom && !tokenAddress) {
    return 0
  }

  if (native && cosmWasmClient) {
    const coin = await cosmWasmClient.getBalance(address, denom)
    const amount = coin ? Number(coin.amount) : 0
    return convertMicroDenomToDenom(amount, decimals)
  }
  if (tokenAddress) {
    try {
      const balance = await CW20(cosmWasmClient, signingClient).
        use(tokenAddress).
        balance(address)
      return convertMicroDenomToDenom(Number(balance), decimals)
    } catch (err) {
      return 0
    }
  }

  return 0
}

export const useTokenBalance = (tokenSymbol: string) => {
  const { network, walletChainName } = useRecoilValue(chainState)
  const { cosmWasmClient, signingClient } = useClients(walletChainName)
  const { address } = useChain(walletChainName)
  const tokenInfo = useTokenInfo(tokenSymbol)
  const ibcAssetInfo = useIBCAssetInfo(tokenSymbol)
  const {
    data: balance = 0,
    isLoading,
    refetch,
  } = useQuery(
    ['tokenBalance', tokenSymbol, address, network],
    async () => await fetchTokenBalance({
      cosmWasmClient,
      signingClient,
      address,
      token: tokenInfo || ibcAssetInfo,
    }),
    {
      enabled:
        Boolean(tokenSymbol) &&
        Boolean(address) &&
        Boolean(cosmWasmClient) &&
        (Boolean(tokenInfo) || Boolean(ibcAssetInfo)),
      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
      refetchIntervalInBackground: true,
    },
  )
  return {
    balance,
    isLoading,
    refetch,
  }
}

export const useMultipleTokenBalance = (tokenSymbols?: Array<string>, isBonding?: boolean) => {
  const { network, chainId, walletChainName } = useRecoilValue(chainState)
  const { cosmWasmClient, signingClient, stargateClient } = useClients(walletChainName)
  const { address, isWalletConnected } = useChain(walletChainName)
  const [tokenList] = useTokenList()
  const { data: config, isLoading: isConfigLoading } = useConfig(network, chainId)

  if (!isConfigLoading && isBonding && config?.bonding_tokens) {
    for (const newToken of config.bonding_tokens) {
      const isTokenAdded = tokenList?.tokens.find((existingToken) => existingToken.denom === newToken.denom);
      if (!isTokenAdded) {
        tokenList?.tokens.push(newToken);
      }
    }
  }

  const queryKey = useMemo(() => `multipleTokenBalances/${tokenSymbols?.join('+')}`,
    [tokenSymbols])

  const { data, isLoading } = useQuery(
    [queryKey, address, chainId, network],

    async () => {
      const nativeBalances = await stargateClient.getAllBalances(address)
      const out = await Promise.all(tokenSymbols.map(async (symbol) => {
        const token = getTokenInfoFromTokenList(symbol, tokenList.tokens)
        let balance = 0
        if (!token?.native) {
          balance = await fetchTokenBalance({
            cosmWasmClient,
            signingClient,
            token,
            address,
          })
        } else {
          balance = convertMicroDenomToDenom((nativeBalances.find((b) => b.denom === token.denom)?.amount || 0), token.decimals)
        }
        return balance || 0
      }))
      return out
    },
    {
      enabled: Boolean(isWalletConnected &&
        tokenSymbols?.length &&
        tokenList?.tokens &&
        cosmWasmClient) &&
        !isConfigLoading,
      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
      refetchIntervalInBackground: true,

      onError(error) {
        console.error('Cannot fetch token balance bc:', error)
      },
    },
  )
  return [data, isLoading] as const
}
