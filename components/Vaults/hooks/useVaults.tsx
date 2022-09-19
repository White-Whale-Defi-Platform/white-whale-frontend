
import { useQuery, useQueries } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { useEffect, useMemo } from 'react'
import { useGetTokenDollarValueQuery } from 'queries/useGetTokenDollarValueQuery'
import { fromChainAmount, formatPrice } from 'libs/num'

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
}

export type VaultsResponse = {
    factory: string
    vaults: Array<PoolEntityType>
    name: string
    logoURI: string
    keywords: Array<string>
    tags: Record<string, { name: string; description: string }>
}

const queryShare = (client, contract, amount) => {
    if (!!!amount) return null
    return client.queryContractSmart(contract, {
        "share": { amount }
    })
}
const queryVault = async  (client, contract, tokenInfo, getTokenDollarValue) => {
    const  info = await client.queryContractSmart(contract, {
        "token_info": {}
    })

    const dollarValue = await getTokenDollarValue({
        tokenInfo: tokenInfo,
        tokenAmountInDenom: fromChainAmount(info?.total_supply),
    })

    return {...info, dollarValue : formatPrice(dollarValue)}
}

const queryBalance = async (client, contract, address, vault, tokenInfo, getTokenDollarValue) => {

    const lpBalance = await client.queryContractSmart(contract, {
        "balance": { address }
    })

    const underlyingAsset = await queryShare(client, vault, lpBalance?.balance)

    const dollarValue = await getTokenDollarValue({
        tokenInfo: tokenInfo,
        tokenAmountInDenom: fromChainAmount(underlyingAsset),
    })

    return { lpBalance: lpBalance?.balance, underlyingAsset, dollarValue : formatPrice(dollarValue) }
}


type useVaultDepostProps = {
    lpToken: string[],
    options?: Parameters<typeof useQuery>[1]
}


export const useVaultDepost = (lpToken: string, vaultAddress, tokenInfo) => {
    const { chainId, client, address , network} = useRecoilValue(walletState)
    const [getTokenDollarValue] = useGetTokenDollarValueQuery()

    const { data: balance, isLoading , refetch} = useQuery(
        ['vaultsDeposit', lpToken, chainId, network],
        async () => {
            console.log("calling depost")
            return queryBalance(client, lpToken, address, vaultAddress, tokenInfo,  getTokenDollarValue)
        },
        {
            enabled: !!chainId && !!client && !!lpToken && !!getTokenDollarValue,
        }
    )

    return { balance, isLoading, refetch }

}
export const useVaultMultiDepost = (lpTokens: any[]) => {

    const { chainId, client, address, network } = useRecoilValue(walletState)
    const [getTokenDollarValue] =
        useGetTokenDollarValueQuery()

    const { data: balance, isLoading, refetch } = useQuery(
        ['vaultsDeposits', lpTokens, chainId, network],
        async () => {
            return Promise.all(
                lpTokens.map(({ lp_token, vault_address, vault_assets }) =>
                    queryBalance(client, lp_token, address, vault_address, vault_assets, getTokenDollarValue)
                )
            )
        },
        {
            enabled: !!chainId && !!client && !!lpTokens?.length,

        }
    )

    return { balance, isLoading, refetch }

}
export const useVaulTotal = (lpTokenIds: any[]) => {
    const { chainId, client, address, network } = useRecoilValue(walletState)
    const [getTokenDollarValue] =
        useGetTokenDollarValueQuery()

    const { data: balance, isLoading } = useQuery(
        ['vaultsInfo', lpTokenIds, chainId, network],
        async () => {
            return Promise.all(
                lpTokenIds.map(({lp_token, vault_assets}) =>
                    queryVault(client, lp_token, vault_assets, getTokenDollarValue)
                )
            )
        },
        {
            enabled: !!chainId && !!client && !!lpTokenIds?.length && !!getTokenDollarValue,
            refetchOnMount: false,

        }
    )

    return { balance : balance, isLoading }

}


export const useVaults = (options?: Parameters<typeof useQuery>[1]) => {
    const { chainId, client, network } = useRecoilValue(walletState)
    const [getTokenDollarValue] = useGetTokenDollarValueQuery()


    const { data: vaults, isLoading } = useQuery<VaultsResponse>(
        ['vaults/list', chainId, network],
        async () => {
            const url = `/${network}/${chainId}${process.env.NEXT_PUBLIC_VAULTS_LIST_URL}`
            const response = await fetch(url)
            return await response?.json()
        },
        {
            ...options,
            enabled: !!chainId && !!client,
            refetchOnMount: false,

        }
    )

    // const lpTokens = useMemo(() => vaults?.vaults?.map(({ lp_token, vault_address, vault_assets }) => ({ lp_token, vault_address, vault_assets })), [vaults])
    const { balance, refetch } = useVaultMultiDepost(vaults?.vaults?.map(({ lp_token, vault_address, vault_assets }) => ({ lp_token, vault_address, vault_assets })))

    const {balance: vaultInfo} = useVaulTotal(vaults?.vaults?.map(({lp_token, vault_assets}) => ({lp_token, vault_assets})))

    const withBalance = useMemo(() => {
        if (!vaults) return null

        const _vaults = vaults.vaults.map((vault, index) => ({
            ...vault,
            hasDepost: Number(balance?.[index].lpBalance) > 0 ? true : false,
            deposits: balance?.[index],
            totalDepost :  vaultInfo?.[index] 
        }))

        return { ...vaults, vaults: _vaults}

    }, [balance, vaults, vaultInfo])

    return { vaults: withBalance, isLoading , refetch}
}


export default useVaults
