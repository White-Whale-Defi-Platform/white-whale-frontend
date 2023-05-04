import dayjs from "dayjs";
import usePrices from "hooks/usePrices";
import { useTokenList } from "hooks/useTokenList";
import { fromChainAmount, num } from "libs/num";
import { useQueryPoolLiquidity } from "queries/useQueryPools";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";
import { walletState } from "state/atoms/walletAtoms";
import { formatSeconds } from "util/formatSeconds";
import { TokenInfo } from "queries/usePoolsListQuery";

export type Position = {
    amount: number
    weight: string
    duration: string
    assets: TokenInfo & { dollarValue: number, assetAmount: number }[]
    value: number
    state: string
    action: null
    isOpen: boolean
    formatedTime: string
}

const lpToAssets = ({ totalReserve, totalLpSuppy, providedLp }) => {
    return [
        num(totalReserve?.[0]).times(providedLp).div(totalLpSuppy).dp(6).toNumber(),
        num(totalReserve?.[1]).times(providedLp).div(totalLpSuppy).dp(6).toNumber(),
    ]
}

const usePositions = (poolId: string) => {
    const [{ liquidity = {}, pool_assets = [], staking_address } = {}] = useQueryPoolLiquidity({ poolId })
    const totalLpSuppy = liquidity?.available?.total?.tokenAmount || 0
    const totalReserve = liquidity?.reserves?.total || [0, 0]
    const { address, client } = useRecoilValue(walletState)
    const tokens = useTokenList()
    const prices = usePrices()

    return useQuery({
        queryKey: ['positions', address, staking_address, poolId, tokens, pool_assets, prices],
        queryFn: (): Promise<Position[]> => {
            return client?.queryContractSmart(staking_address, {
                positions: { address }
            })
                .then(data => data.positions.map(p => {
                    const positiosns = []

                    // open position
                    const open = { ...p?.open_position || {} }
                    open.formatedTime = formatSeconds(open.unbonding_duration)
                    open.isOpen = true
                    if (p?.open_position) positiosns.push(open)

                    // closed position
                    const close = { ...p?.closed_position || {} }
                    const today = dayjs(new Date())
                    const unbounding = dayjs.unix(close.unbonding_timestamp)
                    const diff = unbounding.diff(today, 'second')
                    close.formatedTime = formatSeconds(diff)
                    close.isOpen = false
                    if (p?.closed_position) positiosns.push(close)

                    return positiosns.map((position) => {
                        const lpAssets = lpToAssets({ totalReserve, totalLpSuppy, providedLp: position.amount })
                        const assets = pool_assets.map((asset, i) => {
                            const assetAmount = fromChainAmount(lpAssets[i], asset.decimals)
                            const dollarValue = num(assetAmount).times(prices?.[asset.symbol] || 0).toNumber()
                            return {
                                ...asset,
                                assetAmount: parseFloat(assetAmount),
                                dollarValue,
                            }
                        })
                        return {
                            ...position,
                            duration: position.formatedTime,
                            weight: position.weight,
                            assets,
                            value: assets.reduce((acc, asset) => {
                                return acc + Number(asset.dollarValue)
                            }, 0),
                            state: position.isOpen ? 'active' : diff <= 0 ? 'unbound' : 'unbounding',
                            action: null,
                        }
                    })

                }).flat())
        },
        enabled: !!address && !!client && !!staking_address,
    })
}

export default usePositions