import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { useChain } from '@cosmos-kit/react-lite'
import { TokenInfo } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { useQueryPoolLiquidity } from 'components/Pages/Trade/Pools/hooks/useQueryPoolsLiquidity'
import { useClients } from 'hooks/useClients'
import { usePrices } from 'hooks/usePrices'
import { useTokenList } from 'hooks/useTokenList'
import { fromChainAmount, num } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

export type RewardInfo = {
  amount: number
  dollarValue: number
  info: {
    token?: {
      contract_addr: string
    }
    native_token?: {
      denom: string
    }
  }
}

export type RewardData = TokenInfo & RewardInfo

export type RewardsResult = {
  rewards: RewardData[]
  totalValue: string
}

const aggregateRewards = (rewards: RewardData[]): RewardInfo[] => {
  // Use reduce to create the aggregates
  const aggregates = rewards.reduce((acc: { [id: string]: number }, reward) => {
    // Use contract_addr if it exists, otherwise use denom
    const denom =
      reward.info.token?.contract_addr || reward.info.native_token?.denom

    // If neither contract_addr nor denom exist, skip this reward
    if (!denom) {
      return acc
    }
    const { amount } = reward
    acc[denom] = (acc[denom] || 0) + Number(amount)
    return acc
  }, {})
  // Use Object.entries and map to transform aggregates into an array of rewards
  return Object.entries(aggregates).map(([id, amount]) => {
    // Determine whether id is a contract_addr or a denom
    const isContract = id.startsWith('contract:')

    return {
      amount,
      dollarValue: 0,
      info: isContract
        ? { token: { contract_addr: id } }
        : { native_token: { denom: id } },
    }
  })
}
const useRewards = (poolId: string): RewardsResult => {
  const [tokenList] = useTokenList()
  const prices = usePrices()
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [{ staking_address = null } = {}] = useQueryPoolLiquidity({ poolId })

  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { cosmWasmClient } = useClients(walletChainName)

  const { data: rewards = [] } = useQuery({
    queryKey: ['rewards', staking_address, address],
    queryFn: async (): Promise<RewardsResult> => await cosmWasmClient.queryContractSmart(staking_address, {
      rewards: { address },
    }),
    select: (data) => data?.rewards || [],
    enabled: Boolean(staking_address) && Boolean(address) && Boolean(cosmWasmClient),
  })
  // @ts-ignore
  if (window.debugLogsEnabled) {
    console.log('Rewards: ', rewards)
  }

  const aggregatedRewards = useMemo(() => aggregateRewards(rewards), [rewards])

  return useMemo(() => {
    const rewardsWithToken: RewardData[] = []

    aggregatedRewards?.forEach((reward) => {
      // Cw20 token
      if (reward.info.token) {
        const t = tokenList?.tokens.find((token) => token.denom === reward.info.token.contract_addr)
        const amount = fromChainAmount(reward.amount, t?.decimals)
        const dollarValue = num(amount).
          times(prices?.[t?.symbol] || 0).
          dp(2).
          toNumber()
        rewardsWithToken.push({
          ...t,
          ...reward,
          amount: parseFloat(amount),
          dollarValue,
        })
      }
      // Native token
      if (reward.info.native_token) {
        const t = tokenList?.tokens.find((token) => token.denom === reward.info.native_token.denom)
        const amount = fromChainAmount(reward.amount, t?.decimals)
        const dollarValue = num(amount).
          times(prices?.[t?.symbol] || 0).
          dp(4).
          toNumber()
        rewardsWithToken.push({
          ...t,
          ...reward,
          amount: parseFloat(amount),
          dollarValue,
        })
      }
    })

    return {
      rewards: rewardsWithToken,
      totalValue: rewardsWithToken?.
        reduce((acc, reward) => acc + reward.dollarValue, 0)?.
        toFixed(2),
    } as RewardsResult
  }, [aggregatedRewards, tokenList, prices])
}

export default useRewards
