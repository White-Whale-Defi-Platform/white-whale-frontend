import { PoolTokenValue } from 'queries/useQueryPoolsLiquidity'
import { RewardsInfoResponse, getRewardsInfo } from 'services/rewards'
import { convertMicroDenomToDenom } from 'util/conversion'

import { InternalQueryContext } from './types'
import { PoolEntityType, TokenInfoWithReward } from './usePoolsListQuery'

const blocksPerSecond = 6
const blocksPerYear = (525_600 * 60) / blocksPerSecond

export type QueryRewardsContractsArgs = {
  swapAddress: PoolEntityType['swap_address']
  rewardsTokens: PoolEntityType['rewards_tokens']
  context: InternalQueryContext
}

export type SerializedRewardsContract = {
  contract: RewardsInfoResponse
  tokenInfo: TokenInfoWithReward
  rewardRate: {
    ratePerBlock: PoolTokenValue
    ratePerYear: PoolTokenValue
  }
}

export const queryRewardsContracts = async ({
  rewardsTokens,
  context: { cosmWasmClient, getTokenDollarValue },
}: QueryRewardsContractsArgs): Promise<Array<SerializedRewardsContract>> => {
  const rewardsContractsInfo = await Promise.all(rewardsTokens.map(({ rewards_address }) => getRewardsInfo(rewards_address, cosmWasmClient)))

  const currentHeight = await cosmWasmClient.getHeight()

  return Promise.all(rewardsContractsInfo.map(async (contractInfo, index) => {
    const tokenInfo = rewardsTokens[index]
    const expired = currentHeight > contractInfo.reward.period_finish

    const rewardRatePerBlockInTokens = expired
      ? 0
      : convertMicroDenomToDenom(contractInfo.reward.reward_rate,
        tokenInfo.decimals)

    const rewardRatePerBlockInDollarValue = expired
      ? 0
      : await getTokenDollarValue({
        tokenInfo,
        tokenAmountInDenom: rewardRatePerBlockInTokens,
      })

    const rewardRate = {
      ratePerBlock: {
        tokenAmount: rewardRatePerBlockInTokens,
        dollarValue: rewardRatePerBlockInDollarValue,
      },
      ratePerYear: {
        tokenAmount: rewardRatePerBlockInTokens * blocksPerYear,
        dollarValue: rewardRatePerBlockInDollarValue * blocksPerYear,
      },
    }

    return {
      contract: contractInfo,
      rewardRate,
      tokenInfo,
    }
  }))
}
