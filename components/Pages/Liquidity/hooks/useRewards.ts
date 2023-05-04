import { useQuery } from "react-query"
import usePrices from "hooks/usePrices"
import { useTokenList } from "hooks/useTokenList"
import { useMemo } from "react"
import { fromChainAmount, num } from "libs/num"
import { TokenInfo } from "../../../../queries/usePoolsListQuery"


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

type RewardData = {
    amount: string;
    info: {
        token?: {
            contract_addr: string;
        };
        native_token?: {
            denom: string;
        };
    };
}

export type Reward = TokenInfo & {
    assetAmount: number;
    dollarValue: number;
}

export type RewardsResult = {
    rewards: Reward[];
    totalValue: number;
}

const useRewards = () => {

    const [tokenList] = useTokenList()
    const prices = usePrices()

    const { data: rewards = [] } = useQuery({
        queryKey: 'rewards',
        queryFn: async (): Promise<RewardData[]> => {
            return Promise.resolve(rewardsMock)
        }
    })

    return useMemo(() => {
        const rewardsWithToken = []

        rewards?.forEach((reward) => {
            //cw20 token
            if (reward.info.token) {
                const t = tokenList?.tokens.find((token) => token.denom === reward.info.token.contract_addr)
                const amount = fromChainAmount(reward.amount, t?.decimals)
                const dollarValue = num(amount).times(prices?.[t?.symbol] || 0).dp(2).toNumber()
                rewardsWithToken.push({
                    ...t,
                    assetAmount: parseFloat(amount),
                    dollarValue
                })
            }
            //native token
            if (reward.info.native_token) {
                const t = tokenList?.tokens.find((token) => token.denom === reward.info.native_token.denom)
                const amount = fromChainAmount(reward.amount, t?.decimals)
                const dollarValue = num(amount).times(prices?.[t?.symbol] || 0).dp(4).toNumber()
                rewardsWithToken.push({
                    ...t,
                    assetAmount: parseFloat(amount),
                    dollarValue
                })
            }
        })

        return {
            rewards: rewardsWithToken,
            totalValue: rewardsWithToken?.reduce((acc, reward) => acc + reward.dollarValue, 0)?.toFixed(2)
        } as RewardsResult


    }, [rewards, tokenList, prices])
}

export default useRewards