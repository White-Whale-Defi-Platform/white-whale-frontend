import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { useRecoilValue } from 'recoil'
import { convertMicroDenomToDenom } from 'util/conversion'

import { CW20 } from '../services/cw20'
import { walletState, WalletStatusType } from '../state/atoms/walletAtoms'
import { DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL } from '../util/constants'
import {Wallet} from "../util/wallet-adapters";
import { getIBCAssetInfoFromList, useIBCAssetInfo } from './useIBCAssetInfo'
import { IBCAssetInfo, useIBCAssetList } from './useIbcAssetList'
import { getTokenInfoFromTokenList, useTokenInfo } from './useTokenInfo'
import { useTokenList } from './useTokenList'

async function fetchTokenBalance({
  client,
  token = {},
  address,
}: {
  client: Wallet
  token: any,
  address: string
}) {

  const{ denom, native, token_address, decimals }  = token || {}

  if (!denom && !token_address) {
    return 0
    // throw new Error(
    //   `No denom or token_address were provided to fetch the balance.`
    // )
  }

  /*
   * if this is a native asset or an ibc asset that has juno_denom
   *  */
  if (native && !!client) {
    const coin = await client.getBalance(address, denom)
    const amount = coin ? Number(coin.amount) : 0
    return convertMicroDenomToDenom(amount, decimals)
    // return {
    //   balance : convertMicroDenomToDenom(amount, decimals),
    //   ...token
    // }
  }

  /*
   * everything else
   *  */
  if (token_address) {
    try{
      const balance = await CW20(client).use(token_address).balance(address)
      return convertMicroDenomToDenom(Number(balance), decimals)
    }catch(err){
      return 0
    }
    // return {
    //   balance : convertMicroDenomToDenom(Number(balance), decimals),
    //   ...token
    // }
  }

  return 0
}

const mapIbcTokenToNative = (ibcToken?: IBCAssetInfo) => {
  if (ibcToken?.juno_denom) {
    return {
      ...ibcToken,
      native: true,
      denom: ibcToken.juno_denom,
    }
  }
  return undefined
}

export const useTokenBalance = (tokenSymbol: string) => {
  const { address, network, client, activeWallet } = useRecoilValue(walletState)

  const tokenInfo = useTokenInfo(tokenSymbol)
  const ibcAssetInfo = useIBCAssetInfo(tokenSymbol)


  const { data: balance = 0, isLoading, refetch} = useQuery(
    ['tokenBalance', tokenSymbol, address, network],
    async ({ queryKey: [, symbol] }) => {
      // if (tokenSymbol && client && (tokenInfo || ibcAssetInfo)) {
        return await fetchTokenBalance({
          client,
          address,
          token: tokenInfo || ibcAssetInfo,
        })
      // }
    },
    {
      enabled: !!tokenSymbol && !!client && (!!tokenInfo || !!ibcAssetInfo),
      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
      refetchIntervalInBackground: true,
    }
  )

  return { balance, isLoading : isLoading , refetch}
}


export const useMultipleTokenBalance = (tokenSymbols?: Array<string>) => {
  const { address, status, client , chainId, network} = useRecoilValue(walletState)
  const [tokenList] = useTokenList()
  const [ibcAssetsList] = useIBCAssetList()

  const queryKey = useMemo(
    () => `multipleTokenBalances/${tokenSymbols?.join('+')}`,
    [tokenSymbols]
  )


  const { data, isLoading } = useQuery(
    [queryKey, address, chainId, network],
    async () => {
      const balances = await Promise.all(
        tokenSymbols
        // .filter(Boolean)
        .map((tokenSymbol) =>
          {

            return fetchTokenBalance({
              client,
              address,
              token:
                getTokenInfoFromTokenList(tokenSymbol, tokenList.tokens) ||
                mapIbcTokenToNative(
                  getIBCAssetInfoFromList(tokenSymbol, ibcAssetsList?.tokens)
                ) ||
                {},
            })
          }
        )
      )

      return balances

    },
    {
      enabled: Boolean(
        status === WalletStatusType.connected &&
          tokenSymbols?.length &&
          tokenList?.tokens
      ),

      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
      refetchIntervalInBackground: true,

      onError(error) {
        console.error('Cannot fetch token balance bc:', error)
      },
    }
  )

  return [data, isLoading] as const
}
