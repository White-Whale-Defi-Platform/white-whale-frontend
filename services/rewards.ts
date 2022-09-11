import {
  createExecuteMessage,
  validateTransactionSuccess,
} from '../util/messages'
import {Wallet} from "../util/wallet-adapters";

type Denom =
  | {
      native: string
    }
  | {
      /* cw20 token_address */
      cw20: string
    }

export const claimRewards = async (
  senderAddress: string,
  rewardsAddresses: Array<string>,
  client: Wallet
) => {
  const claimRewardsMsg = { claim: {} }

  const messages = rewardsAddresses.map((rewardsAddress) =>
    createExecuteMessage({
      senderAddress,
      contractAddress: rewardsAddress,
      message: claimRewardsMsg,
    })
  )

  return validateTransactionSuccess(
    await client.post(senderAddress, messages)
  )
}

type PendingRewardsResponse = {
  address: string
  pending_rewards: number
  denom: Denom
}

export const getPendingRewards = async (
  address: string,
  rewardsAddress: string,
  client: Wallet
): Promise<PendingRewardsResponse> => {
  const msg = { get_pending_rewards: { address } }
  return await client.queryContractSmart(rewardsAddress, msg)
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

export const getRewardsInfo = async (
  rewardsAddress: string,
  client: Wallet
): Promise<RewardsInfoResponse> => {
  const msg = { info: {} }
  return await client.queryContractSmart(rewardsAddress, msg)
}
