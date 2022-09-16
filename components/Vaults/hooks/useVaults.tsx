
import { useQuery } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { networkAtom } from 'state/atoms/walletAtoms'
import { useEffect, useMemo } from 'react'

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

const queryBalance = (client, contract, address) => {
    return client.queryContractSmart(contract, {
        "balance": {
            "address": address
        }
    })
}

type useVaultDepostProps = {
    lpToken: string[],
    options?: Parameters<typeof useQuery>[1]
}


export const useVaultDepost = (lpToken: string) => {

    const { chainId, client, address } = useRecoilValue(walletState)
    const network = useRecoilValue(networkAtom)

    const { data: balance, isLoading } = useQuery(
        ['@vaults/deposits', lpToken, chainId, network],
        async () => {
            return queryBalance(client, lpToken, address)

        },
        {
            enabled: !!chainId && !!client && !!lpToken,
            refetchOnMount: false,

        }
    )

    return { balance: balance?.balance, isLoading }

}
export const useVaultMultiDepost = (lpTokens: string[]) => {

    const { chainId, client, address } = useRecoilValue(walletState)
    const network = useRecoilValue(networkAtom)

    const { data: balance, isLoading } = useQuery(
        ['@vaults/deposits', lpTokens, chainId, network],
        async () => {
            return Promise.all(
                lpTokens.map((lpToken) =>
                    queryBalance(client, lpToken, address)
                )
            )

        },
        {
            enabled: !!chainId && !!client && !!lpTokens?.length,
            refetchOnMount: false,

        }
    )

    return { balance: balance?.map(b => b.balance), isLoading }

}




export const useVaults = (options?: Parameters<typeof useQuery>[1]) => {
    const { chainId, client, address } = useRecoilValue(walletState)
    const network = useRecoilValue(networkAtom)

    const { data: vaults, isLoading } = useQuery<VaultsResponse>(
        ['@vaults/list', chainId, network],
        async () => {
            const url = `/${network}/${chainId}${process.env.NEXT_PUBLIC_VAULTS_LIST_URL}`
            const response = await fetch(url)
            return await response.json()
        },
        {
            ...options,
            enabled: !!chainId,
            refetchOnMount: false,

        }
    )

    const lpTokens = useMemo(() => vaults?.vaults?.map(({ lp_token }) => lp_token), [vaults])
    const { balance } = useVaultMultiDepost(lpTokens)

    const withBalance = useMemo(() => {

        if (!vaults) return null

        console.log({ balance })

        const _vaults = vaults.vaults.map((vault, index) => ({
            ...vault,
            hasDepost : Number(balance?.[index]) > 0 ? true : false,
            deposits: { lptoken: balance?.[index] }
        }))

        return { ...vaults, vaults: _vaults }

    }, [balance, vaults])

    return { vaults: withBalance, isLoading }
}

export default useVaults