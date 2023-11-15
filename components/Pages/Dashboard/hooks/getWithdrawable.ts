import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { convertMicroDenomToDenom } from 'util/conversion'

import { Config } from './useDashboardData'

export interface WithdrawableInfo {
  amount: number
  denom: string
  tokenSymbol: string
}

const fetchWithdrawable = async (
  client: CosmWasmClient,
  address: string,
  config: Config,
): Promise<WithdrawableInfo[]> => {
  const results = await Promise.all(Object.entries(config.bonding_tokens).map(async ([_, token]) => {
    const withdrawableInfo: { withdrawable_amount: string } =
      await client.queryContractSmart(config.whale_lair, {
        withdrawable: { address,
          denom: token.denom },
      })
    return {
      amount: convertMicroDenomToDenom(withdrawableInfo.withdrawable_amount,
        token.decimals),
      denom: token.denom,
    }
  }))

  return results as WithdrawableInfo[]
}

export const getWithdrawable = async (
  client: CosmWasmClient,
  address: string,
  config: Config,
) => {
  if (!client || !address) {
    return null
  }

  const withdrawableData = await fetchWithdrawable(
    client, address, config,
  )

  const withdrawableInfos: WithdrawableInfo[] = withdrawableData?.
    flatMap((item) => item).
    map((item) => {
      const tokenSymbol = config.bonding_tokens.find((token) => token.denom === item.denom)?.tokenSymbol

      return {
        amount: item.amount,
        denom: item.denom,
        tokenSymbol,
      }
    })

  return { withdrawableInfos }
}

