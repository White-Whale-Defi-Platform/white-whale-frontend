import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

type Denom =
  | {
      native: string
    }
  | {
      /* Cw20 token_address */
      cw20: string
    }

export type RewardsInfoResponse = {
  config: {
    owner?: string
    manager?: string
    staking_contract: string
    reward_token: Denom
  }
  reward: {
    period_finish: number
    reward_rate: number
    reward_duration: number
  }
}

export const getRewardsInfo = (rewardsAddress: string,
  client: CosmWasmClient): Promise<RewardsInfoResponse> => {
  const msg = { info: {} }
  return client.queryContractSmart(rewardsAddress, msg)
}
