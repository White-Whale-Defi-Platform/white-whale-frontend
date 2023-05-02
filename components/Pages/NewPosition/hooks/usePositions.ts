import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";
import { walletState } from "state/atoms/walletAtoms";
import { formatSeconds } from "util/formatSeconds";
import { useGetTokenDollarValueQuery } from 'queries/useGetTokenDollarValueQuery'
import { useGetTokenInfoByDenom } from "hooks/useRewardsQueries";
import { useTokenDollarValue } from "hooks/useTokenDollarValue";
import { protectAgainstNaN } from "util/conversion/conversion";
import { useQueryPoolLiquidity } from "queries/useQueryPools";

const lpToAssets = ({totalReserve, totalLpSuppy, providedLp}) => {
      return [ protectAgainstNaN(
          totalReserve[0] * (Number(providedLp) / totalLpSuppy)/ 10**6
        ),
        protectAgainstNaN(
          (totalReserve[1] * (Number(providedLp) / totalLpSuppy)/ 10**6)
        )]
}

const usePositions = (contractAddress: string, poolId:string) => {
    const [getTokenDollarValue, enabledGetTokenDollarValue] = useGetTokenDollarValueQuery()
    const [{ liquidity = {} } = {}] = useQueryPoolLiquidity({ poolId })

    const totalLpSuppy = liquidity?.available?.total?.tokenAmount || 0
    const totalReserve = liquidity?.reserves?.total || [0, 0]
    const { address, client } = useRecoilValue(walletState)

    return useQuery({
        queryKey: 'positions',
        queryFn: () => {
            return client?.queryContractSmart(contractAddress, {
                positions: { address }
            })
                .then(data => data.positions.map(p => {
                    const positiosns = []

                    const open = p?.open_position || {}
                    open.formatedTime= formatSeconds(open.unbonding_duration)
                    open.isOpen = true
                    if(p?.open_position) positiosns.push(open)
                    
                    const close = p?.close_position || {}
                    close.formatedTime= formatSeconds(close.unbonding_duration)
                    close.isOpen = false
                    if(p?.close_position) positiosns.push(close)

                    return positiosns.map((p) => ({
                        duration : p.formatedTime,
                        value: p.amount,
                        weight: p.weight,
                        assets : lpToAssets({totalReserve, totalLpSuppy, providedLp: p.amount}),
                        state: p.isOpen ? 'active' : 'unbounding',
                        action: null,
                    }))

                }).flat())
        },
        enabled: !!address && !!client && !!contractAddress,
    })
}

export default usePositions