import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useChain } from '@cosmos-kit/react-lite'
import { useClients } from 'hooks/useClients'
import { usePrices } from 'hooks/usePrices'
import { formatPrice } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { isNativeToken } from 'services/asset'
import { chainState } from 'state/chainState'
import { convertMicroDenomToDenom } from 'util/conversion/index'

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
  cosmWasmClient: CosmWasmClient,
  contractAddress: string,
  amount: number,
) => {
  if (!amount) {
    return null
  }
  return cosmWasmClient.queryContractSmart(contractAddress, {
    share: { amount: amount.toString() },
  })
}
const queryVault = async (
  cosmWasmClient: CosmWasmClient,
  lpTokenAddress: string,
  vaultAssetInfo: TokenInfo,
  prices: any,
  vaultAddress: string,
) => {
  let balance : any
  if (isNativeToken(lpTokenAddress)) {
    balance = (await cosmWasmClient.getBalance(vaultAddress, vaultAssetInfo?.denom))?.amount
  } else {
    balance = (await cosmWasmClient.queryContractSmart(lpTokenAddress, {
      token_info: {},
    }))?.total_supply
  }

  const dollarValue = prices[vaultAssetInfo.symbol] * convertMicroDenomToDenom(balance, vaultAssetInfo.decimals)

  return {
    dollarValue: formatPrice(dollarValue) }
}

const queryBalance = async (
  cosmWasmClient: CosmWasmClient,
  contractAddress: string,
  address: string,
  vaultAddress: string,
  vaultAssetInfo: TokenInfo,
  prices: any,
) => {
  let lpBalance = 0
  if (isNativeToken(contractAddress)) {
    const balance = await cosmWasmClient.getBalance(address, contractAddress)
    lpBalance = balance ? Number(balance.amount) : 0
  } else {
    lpBalance = (await cosmWasmClient.queryContractSmart(contractAddress, {
      balance: { address },
    }))?.balance
  }
  const underlyingAssetAmount = await queryShare(
    cosmWasmClient,
    vaultAddress,
    lpBalance,
  )
  const dollarValue = prices[vaultAssetInfo.symbol] * convertMicroDenomToDenom(underlyingAssetAmount, vaultAssetInfo.decimals)
  return {
    lpBalance,
    underlyingAssetAmount,
    dollarValue: formatPrice(dollarValue),
  }
}

export const useVaultDeposit = (
  lpToken: string,
  vaultAddress: string,
  tokenInfo: TokenInfo,
) => {
  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { cosmWasmClient } = useClients(walletChainName)
  const prices = usePrices()

  const {
    data: balance,
    isLoading,
    refetch,
  } = useQuery(
    ['vaultsDeposit', lpToken, chainId, address],
    async () => await queryBalance(
      cosmWasmClient,
      lpToken,
      address,
      vaultAddress,
      tokenInfo,
      prices,
    ),
    {
      enabled:
        Boolean(chainId) &&
        Boolean(address) &&
        Boolean(cosmWasmClient) &&
        Boolean(lpToken) &&
        Boolean(prices),
    },
  )

  return { balance,
    isLoading,
    refetch }
}
export const useVaultMultiDeposit = (lpTokens: any[]) => {
  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { cosmWasmClient } = useClients(walletChainName)
  const prices = usePrices()

  const {
    data: balance,
    isLoading,
    refetch,
  } = useQuery(
    ['vaultsDeposits', lpTokens, chainId, prices, address],
    async () => await Promise.all(lpTokens.map(({ lp_token, vault_address, vault_assets }) => queryBalance(
      cosmWasmClient,
      lp_token,
      address,
      vault_address,
      vault_assets,
      prices,
    ))),
    {
      enabled:
        Boolean(chainId) &&
        Boolean(address) &&
        Boolean(cosmWasmClient) &&
        Boolean(lpTokens?.length) &&
        Boolean(prices),
    },
  )

  return { balance,
    isLoading,
    refetch }
}
export const useVaultTotal = (vaultParams: any[]) => {
  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { cosmWasmClient } = useClients(walletChainName)
  const prices = usePrices()

  const { data: balance, isLoading } = useQuery(
    ['vaultsInfo', vaultParams, chainId, prices],
    async () => await Promise.all(vaultParams.map(({ lp_token, vault_assets, vault_address }) => queryVault(
      cosmWasmClient,
      lp_token,
      vault_assets,
      prices,
      vault_address,
    ))),
    {
      enabled:
        Boolean(chainId) && Boolean(vaultParams) && Boolean(prices) && Boolean(cosmWasmClient) && Boolean(vaultParams?.length),
      refetchOnMount: false,
    },
  )
  return { balance,
    isLoading }
}

export const useVaults = (options?: Parameters<typeof useQuery>[1]) => {
  const { chainId, network } = useRecoilValue(chainState)
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

  const { balance, refetch } = useVaultMultiDeposit(vaults?.vaults?.map(({ lp_token, vault_address, vault_assets }) => ({
    lp_token,
    vault_address,
    vault_assets,
  })))

  const { balance: vaultInfo } = useVaultTotal(vaults?.vaults?.map((vault) => ({
    lp_token: vault.lp_token,
    vault_assets: vault.vault_assets,
    vault_address: vault.vault_address,
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
