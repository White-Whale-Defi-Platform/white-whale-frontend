import { JsonObject } from '@cosmjs/cosmwasm-stargate'
import { convertMicroDenomToDenom } from 'util/conversion'
import { Wallet } from 'util/wallet-adapters'

import { Config } from './useDashboardData'

interface Epoch {
  id: string
  start_time: string
  total: {
    amount: string
    info: {
      native_token: {
        denom: string
      }
    }
  }[]
  available: {
    amount: string
    info: {
      native_token: {
        denom: string
      }
    }
  }[]
  claimed: {
    amount: string
    info: {
      native_token: {
        denom: string
      }
    }
  }[]
}

interface Data {
  epochs: Epoch[]
}

export const getClaimable = async (
  client: Wallet | null,
  address: string,
  config: Config
) => {
  if (!client || !address) {
    return null
  }

  const data = await fetchClaimableData(client, address, config)
  const daysSinceLastClaim = data?.epochs.length

  const claimableAmounts = data?.epochs
    .flatMap((e) => e.available.map((a) => a.amount))
    .reduce((acc, amount) => acc + parseFloat(amount), 0)

  const totalGlobalClaimable = convertMicroDenomToDenom(claimableAmounts, 6)
  return { totalGlobalClaimable, daysSinceLastClaim }
}
const fetchClaimableData = async (
  client: Wallet,
  address: string,
  config: Config
): Promise<Data> => {
  const result: JsonObject = await client.queryContractSmart(
    config.fee_distributor,
    {
      claimable: { address },
    }
  )

  return result as Data
}
