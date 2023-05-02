import { useQuery } from "react-query"
import usePrices from "hooks/usePrices"
import { useTokenList } from "hooks/useTokenList"
import { useMemo } from "react"
import { fromChainAmount, num } from "libs/num"


const rewardsMock = [{
    "amount": "1000000",
    "info": {
        "token": {
            "contract_addr": "migaloo1j08452mqwadp8xu25kn9rleyl2gufgfjnv0sn8dvynynakkjukcq5u780c"
        }
    },
},
{
    "amount": "2000000",
    "info": {
        "native_token": {
            "denom": "uwhale"
        }
    }
}]

const useRewards = () => {

    const [tokenList] = useTokenList()
    const prices = usePrices()

    const { data: rewards = [] } = useQuery({
        queryKey: 'rewards',
        queryFn: async () => {
            return rewardsMock
        }
    })

    return useMemo(() => {

        const rewardsWithToken = rewards?.map((reward) => {
            if (reward.info.token) {
                const t = tokenList?.tokens.find((token) => token.denom === reward.info.token.contract_addr)
                const amount = fromChainAmount(reward.amount, t?.decimals)
                const dollarValue = num(amount).times(prices?.[t?.symbol] || 0).dp(2).toNumber()
                return {
                    ...t,
                    assetAmount: parseFloat(amount),
                    dollarValue
                }
            }
            if (reward.info.native_token) {
                const t = tokenList?.tokens.find((token) => token.denom === reward.info.native_token.denom)
                const amount = fromChainAmount(reward.amount, t?.decimals)
                const dollarValue = num(amount).times(prices?.[t?.symbol] || 0).dp(2).toNumber()
                return {
                    ...t,
                    assetAmount: parseFloat(amount),
                    dollarValue
                }
            }
            return false
        }).filter(Boolean)

        return {
            rewards: rewardsWithToken,
            totalValue: rewardsWithToken?.reduce((acc, reward) => acc + reward.dollarValue, 0)?.toFixed(2)
        }


    }, [rewards, tokenList, prices])
}

export default useRewards