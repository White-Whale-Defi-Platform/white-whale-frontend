import { convertMicroDenomToDenom } from 'util/conversion'
import { Wallet } from 'util/wallet-adapters'

import { Config } from './useDashboardData'

interface WithdrawableInfo {
  withdrawable_amount: number
}

export const getWithdrawable = async (
  client: Wallet,
  address: string,
  config: Config
) => {
  if (!client || !address) {
    return null
  }

  const withdrawableInfos = await fetchWithdrawable(client, address, config)

  const withdrawableAmpWhale = convertMicroDenomToDenom(
    withdrawableInfos?.[0]?.withdrawable_amount,
    6
  )
  const withdrawableBWhale = convertMicroDenomToDenom(
    withdrawableInfos?.[1]?.withdrawable_amount,
    6
  )

  return { withdrawableAmpWhale, withdrawableBWhale }
}

const fetchWithdrawable = async (
  client: Wallet,
  address: string,
  config: Config
): Promise<WithdrawableInfo[]> => {
  const results = await Promise.all(
    Object.entries(config.lsd_token).map(async ([key, token]) =>
      client.queryContractSmart(config.whale_lair, {
        withdrawable: { address, denom: token.denom },
      })
    )
  )

  return results as WithdrawableInfo[]
}
