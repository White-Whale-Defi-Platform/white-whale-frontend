
import { useQuery } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { networkAtom } from 'state/atoms/walletAtoms'
import { useEffect, useMemo } from 'react'
import { useGetTokenDollarValueQuery } from 'queries/useGetTokenDollarValueQuery'

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

const queryBalance = async (client, contract, address, vault) => {

    const lpBalance = await client.queryContractSmart(contract, {
        "balance": { address }
    })

    const underlyingAsset = await queryShare(client, vault, lpBalance?.balance)

    return { lpBalance: lpBalance?.balance, underlyingAsset }
}


type useVaultDepostProps = {
    lpToken: string[],
    options?: Parameters<typeof useQuery>[1]
}


export const useVaultDepost = (lpToken: string, vaultAddress) => {

    const { chainId, client, address } = useRecoilValue(walletState)
    const network = useRecoilValue(networkAtom)

    console.log({ lpToken })

    const { data: balance, isLoading } = useQuery(
        ['@vaults/deposit', lpToken, chainId, network],
        async () => {
            return queryBalance(client, lpToken, address, vaultAddress)

        },
        {
            enabled: !!chainId && !!client && !!lpToken,
            refetchOnMount: false,

        }
    )

    return { balance, isLoading }

}
export const useVaultMultiDepost = (lpTokens: any[]) => {

    const { chainId, client, address } = useRecoilValue(walletState)
    const network = useRecoilValue(networkAtom)
    const [getTokenDollarValue, enabledGetTokenDollarValue] =
        useGetTokenDollarValueQuery()

    const { data: balance, isLoading } = useQuery(
        ['@vaults/deposits', lpTokens, chainId, network],
        async () => {
            return Promise.all(
                lpTokens.map(({ lp_token, vault_address }) =>
                    queryBalance(client, lp_token, address, vault_address)
                )
            )
        },
        {
            enabled: !!chainId && !!client && !!lpTokens?.length,
            refetchOnMount: false,

        }
    )

    return { balance, isLoading }

}





export const useVaults = (options?: Parameters<typeof useQuery>[1]) => {
    const { chainId, client, address } = useRecoilValue(walletState)
    const network = useRecoilValue(networkAtom)
    const [getTokenDollarValue, enabledGetTokenDollarValue] =
    useGetTokenDollarValueQuery()


    const { data: vaults, isLoading } = useQuery<VaultsResponse>(
        ['@vaults/list', chainId, network],
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

    const lpTokens = useMemo(() => vaults?.vaults?.map(({ lp_token, vault_address }) => ({ lp_token, vault_address })), [vaults])
    const { balance } = useVaultMultiDepost(lpTokens)

    const withBalance = useMemo(() => {

        if (!vaults) return null

        const _vaults = vaults.vaults.map((vault, index) => ({
            ...vault,
            hasDepost: Number(balance?.[index].lpBalance) > 0 ? true : false,
            deposits: balance?.[index]
        }))

        return { ...vaults, vaults: _vaults }

    }, [balance, vaults])

    return { vaults: withBalance, isLoading }
}

export default useVaults