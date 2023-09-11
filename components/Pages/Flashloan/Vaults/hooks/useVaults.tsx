import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { useCosmwasmClient } from 'hooks/useCosmwasmClient'
import { formatPrice, fromChainAmount } from 'libs/num'
import { useGetTokenDollarValueQuery } from 'queries/useGetTokenDollarValueQuery'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

export type TokenInfo = {
  id: string
  chain_id: string
  token_address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
  tags: string[]
  denom: string
  native: boolean
}

export type TokenInfoWithReward = TokenInfo & {
  rewards_address: string
}

export type PoolEntityType = {
  pool_id: string
  lpOrder: string[] | undefined
  lp_token: string
  vault_assets: TokenInfo
  vault_address: string
  staking_address: string
  rewards_tokens: Array<TokenInfoWithReward>
  deposits?: any
  myDeposit?: any
  totalDeposit?: any
  hasDeposit?: boolean
}

export type VaultsResponse = {
  factory: string
  vaults: Array<PoolEntityType>
  name: string
  logoURI: string
  keywords: Array<string>
  tags: Record<string, { name: string; description: string }>
}

const queryShare = (
  client, contract, amount,
) => {
  if (!amount) {
    return null
  }
  return client.queryContractSmart(contract, {
    share: { amount },
  })
}
const queryVault = async (
  client, contract, tokenInfo, getTokenDollarValue,
) => {
  const info = await client.queryContractSmart(contract, {
    token_info: {},
  })

  const dollarValue = await getTokenDollarValue({
    tokenA: tokenInfo,
    tokenAmountInDenom: fromChainAmount(info?.total_supply),
  })

  return { ...info,
    dollarValue: formatPrice(dollarValue) }
}

const queryBalance = async (
  client,
  contract,
  address,
  vault,
  tokenInfo,
  getTokenDollarValue,
) => {
  const lpBalance = await client.queryContractSmart(contract, {
    balance: { address },
  })

  const underlyingAsset = await queryShare(
    client, vault, lpBalance?.balance,
  )
  const dollarValue = await getTokenDollarValue({
    tokenA: tokenInfo,
    tokenAmountInDenom: fromChainAmount(underlyingAsset),
  })

  return {
    lpBalance: lpBalance?.balance,
    underlyingAsset,
    dollarValue: formatPrice(dollarValue),
  }
}

export const useVaultDeposit = (
  lpToken: string, vaultAddress, tokenInfo,
) => {
  const { chainId, client, address } = useRecoilValue(walletState)
  const [getTokenDollarValue] = useGetTokenDollarValueQuery()

  const {
    data: balance,
    isLoading,
    refetch,
  } = useQuery(
    ['vaultsDeposit', lpToken, chainId],
    async () => queryBalance(
      client,
      lpToken,
      address,
      vaultAddress,
      tokenInfo,
      getTokenDollarValue,
    ),
    {
      enabled:
        Boolean(chainId) &&
        Boolean(client) &&
        Boolean(lpToken) &&
        Boolean(getTokenDollarValue),
    },
  )

  return { balance,
    isLoading,
    refetch }
}
export const useVaultMultiDeposit = (lpTokens: any[]) => {
  const { chainId, client, address } = useRecoilValue(walletState)
  const [getTokenDollarValue] = useGetTokenDollarValueQuery()

  const {
    data: balance,
    isLoading,
    refetch,
  } = useQuery(
    ['vaultsDeposits', lpTokens, chainId],
    async () => Promise.all(lpTokens.map(({ lp_token, vault_address, vault_assets }) => queryBalance(
      client,
      lp_token,
      address,
      vault_address,
      vault_assets,
      getTokenDollarValue,
    ))),
    {
      enabled: Boolean(chainId) && Boolean(client) && Boolean(lpTokens?.length),
    },
  )

  return { balance,
    isLoading,
    refetch }
}
export const useVaultTotal = (lpTokenIds: any[]) => {
  const { chainId } = useRecoilValue(walletState)
  const [getTokenDollarValue, isQueryLoading] = useGetTokenDollarValueQuery()
  const cosmwasmClient = useCosmwasmClient(chainId)
  const { data: balance, isLoading } = useQuery(
    ['vaultsInfo', lpTokenIds, chainId, isQueryLoading],
    async () => Promise.all(lpTokenIds.map(({ lp_token, vault_assets }) => queryVault(
      cosmwasmClient,
      lp_token,
      vault_assets,
      getTokenDollarValue,
    ))),
    {
      enabled:
        Boolean(chainId) && Boolean(lpTokenIds) && Boolean(getTokenDollarValue),
      refetchOnMount: false,
    },
  )
  return { balance,
    isLoading }
}

export const useVaults = (options?: Parameters<typeof useQuery>[1]) => {
  const { chainId, network } = useRecoilValue(walletState)
  const { data: vaults, isLoading } = useQuery<VaultsResponse>(
    ['vaults/list', chainId, network],
    async () => {
      const url = `/${network}/${chainId}${process.env.NEXT_PUBLIC_VAULTS_LIST_URL}`
      const response = await fetch(url)
      return response?.json()
    },
    {
      ...options,
      enabled: Boolean(chainId) && Boolean(network),
      refetchOnMount: false,
    },
  )

  // Const lpTokens = useMemo(() => vaults?.vaults?.map(({ lp_token, vault_address, vault_assets }) => ({ lp_token, vault_address, vault_assets })), [vaults])
  const { balance, refetch } = useVaultMultiDeposit(vaults?.vaults?.map(({ lp_token, vault_address, vault_assets }) => ({
    lp_token,
    vault_address,
    vault_assets,
  })))
  const { balance: vaultInfo } = useVaultTotal(vaults?.vaults?.map(({ lp_token, vault_assets }) => ({
    lp_token,
    vault_assets,
  })))

  const withBalance = useMemo(() => {
    if (!vaults) {
      return null
    }

    const _vaults = vaults.vaults.map((vault, index) => ({
      ...vault,
      hasDeposit: Number(balance?.[index].lpBalance) > 0,
      deposits: balance?.[index],
      totalDeposit: vaultInfo?.[index],
    }))

    return { ...vaults,
      vaults: _vaults }
  }, [balance, vaults, vaultInfo])

  return { vaults: withBalance,
    isLoading,
    refetch }
}

export default useVaults
