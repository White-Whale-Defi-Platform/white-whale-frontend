import { CosmWasmClient, JsonObject } from '@cosmjs/cosmwasm-stargate'
import { convertMicroDenomToDenom } from 'util/conversion'

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

export const getClaimableEpochs = async (client: CosmWasmClient,
  config: Config) => {
  if (!client) {
    return null
  }

  let data : any
  try {
    data = await fetchClaimableEpoch(client, config)
  } catch (error) {
    console.error('Error fetching claimable epochs', config)
    return { globalAvailableRewards: 0,
      annualRewards: 0 }
  }

  const rewardData = data?.epochs.
    flatMap((e) => e.total.map((a) => a.amount)).
    reduce((acc, amount) => acc + parseFloat(amount), 0)
  const globalAvailableRewards = convertMicroDenomToDenom(rewardData, 6)

  const getLastEpochsAverage = (epochs: Epoch[]): number => {
    const lastEpochs = epochs.slice(0, 21)
    const totalAmount = lastEpochs.
      flatMap((e) => e.total.map((a) => a.amount)).
      reduce((acc, amount) => acc + parseFloat(amount), 0)

    return totalAmount / lastEpochs.length
  }

  const extrapolateAnnualRewards = (dailyAverage: number): number => convertMicroDenomToDenom(dailyAverage * 365, 6)

  const dailyAverageRewards = data?.epochs
    ? getLastEpochsAverage(data.epochs)
    : 0
  const annualRewards = extrapolateAnnualRewards(dailyAverageRewards)

  return { globalAvailableRewards,
    annualRewards }
}

export const fetchClaimableEpoch = async (client: CosmWasmClient,
  config: Config): Promise<Data> => {
  const result: JsonObject = await client.queryContractSmart(config.fee_distributor,
    {
      claimable_epochs: {},
    })
  return result as Data
}
