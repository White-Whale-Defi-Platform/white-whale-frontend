import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";
import { walletState } from "state/atoms/walletAtoms";
import { formatSeconds } from "util/formatSeconds";
import { useGetTokenDollarValueQuery } from 'queries/useGetTokenDollarValueQuery'
import { useGetTokenInfoByDenom } from "hooks/useRewardsQueries";
import { useTokenDollarValue } from "hooks/useTokenDollarValue";
import { protectAgainstNaN } from "util/conversion/conversion";
import { useQueryPoolLiquidity } from "queries/useQueryPools";
import usePriceList from "../../../../hooks/usePrices";
import { useTokenList } from "hooks/useTokenList";
import { num } from "libs/num";

const lpToAssets = ({ totalReserve, totalLpSuppy, providedLp }) => {

    return [
        num(totalReserve?.[0]).times(providedLp).div(totalLpSuppy).dp(6).toNumber(),
        num(totalReserve?.[1]).times(providedLp).div(totalLpSuppy).dp(6).toNumber(),
        // protectAgainstNaN(
        //     totalReserve[0] * (Number(providedLp) / totalLpSuppy) / 10 ** 6
        // ),
        // protectAgainstNaN(
        //     (totalReserve[1] * (Number(providedLp) / totalLpSuppy) / 10 ** 6)
        // )
    ]
}

const usePositions = (contractAddress: string, poolId: string) => {
    const [getTokenDollarValue, enabledGetTokenDollarValue] = useGetTokenDollarValueQuery()
    const [{ liquidity = {}, pool_assets = [] } = {}] = useQueryPoolLiquidity({ poolId })
    const pools = useQueryPoolLiquidity({ poolId })

    const totalLpSuppy = liquidity?.available?.total?.tokenAmount || 0
    const totalReserve = liquidity?.reserves?.total || [0, 0]

    const { address, client } = useRecoilValue(walletState)
    const tokens = useTokenList()
    // console.log({ tokens, pool_assets })

    // const dollarValue = useTokenDollarValue("WHALE")
    // const priceList = usePriceList()

    // console.log({priceList})

    return useQuery({
        queryKey: ['positions', address, contractAddress, poolId, tokens, pool_assets],
        queryFn: () => {
            return client?.queryContractSmart(contractAddress, {
                positions: { address }
            })
                .then(data => data.positions.map(p => {
                    const positiosns = []

                    const open = p?.open_position || {}
                    open.formatedTime = formatSeconds(open.unbonding_duration)
                    open.isOpen = true
                    if (p?.open_position) positiosns.push(open)

                    const close = p?.close_position || {}
                    close.formatedTime = formatSeconds(close.unbonding_duration)
                    close.isOpen = false
                    if (p?.close_position) positiosns.push(close)


                    return positiosns.map((p) => {
                        const lpAssets = lpToAssets({ totalReserve, totalLpSuppy, providedLp: p.amount })
                        return {
                            duration: p.formatedTime,
                            value: p.amount,
                            weight: p.weight,
                            assets: pool_assets.map((asset, i) => ({ ...asset, amount: lpAssets[i] })),
                            state: p.isOpen ? 'active' : 'unbounding',
                            action: null,
                        }
                    })

                }).flat())
        },
        enabled: !!address && !!client && !!contractAddress,
    })
}

export default usePositions