import { useMemo } from 'react'
import { useQuery } from 'react-query'

import {
  Config,
  useConfig,
} from 'components/Pages/Bonding/hooks/useDashboardData'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useClients } from 'hooks/useClients'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

dayjs.extend(utc)
interface Epoch {
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
  global_index: {
    bonded_amount: string
    bonded_assets: {
      amount: string
      info: {
        native_token: {
          denom: string
        }
      }
    }[]
  }
  timestamp: string
  weight: string
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
}

interface EpochData {
  epoch: Epoch
}

interface EpochConfig {
  duration: string
  genesis_epoch: string
}

interface DistributionAsset {
  native_token: {
    denom: string
  }
}

interface EpochConfigData {
  owner: string
  bonding_contract_addr: string
  fee_collector_addr: string
  grace_period: string
  epoch_config: EpochConfig
  distribution_asset: DistributionAsset
  // Add any additional properties as needed
}

const useEpoch = () => {
  const { network, chainId, walletChainName } = useRecoilValue(chainState)
  const contracts: Config = useConfig(network, chainId)

  const { cosmWasmClient } = useClients(walletChainName)
  const { data: config } = useQuery<EpochConfigData>({
    queryKey: ['incentive', 'config', contracts?.fee_distributor],
    queryFn: async () =>
      // TODO: API
      await cosmWasmClient?.queryContractSmart(contracts?.fee_distributor, {
        config: {},
      }),
    enabled: Boolean(contracts) && Boolean(cosmWasmClient),
  })

  const { data } = useQuery<EpochData>({
    queryKey: ['incentive', 'epoch', contracts?.fee_distributor],
    queryFn: async () => await cosmWasmClient?.queryContractSmart(contracts?.fee_distributor, {
      current_epoch: {},
    }),
    enabled: Boolean(contracts) && Boolean(cosmWasmClient),
  })
  const dateToEpoch = (givenDate) => {
    if (!data?.epoch?.id || !config?.epoch_config?.duration || !givenDate) {
      return null
    }

    const epochDurationInMillis =
      Number(config?.epoch_config?.duration) / 1_000_000
    const currentEpoch = Number(data?.epoch?.id)

    const now = dayjs().utc()

    // Convert the given date to a dayjs instance in local time
    const givenDateTime = dayjs(givenDate).utc()

    // Const timestampDiffNew = givenDateTime.valueOf() - now.valueOf();
    const timestampDiffNew = givenDateTime.diff(now, 'millisecond')

    const diff = Math.floor(timestampDiffNew / epochDurationInMillis)

    // Calculate the epoch number based on the current epoch and timestamp difference
    return diff < 0 ? currentEpoch : currentEpoch + diff
  }

  const epochToDate = (givenEpoch) => {
    // Check if the current epoch is available or return null
    if (!data?.epoch?.id || !config?.epoch_config?.duration) {
      return null
    }

    // Get the current epoch number
    const currentEpoch = Number(data?.epoch?.id)

    // Set the start time of the epoch to 15:00:00 UTC
    const startTime = dayjs().
      utc().
      set('hour', 15).
      set('minute', 0).
      set('second', 0).
      set('millisecond', 0)

    // Calculate the duration of each epoch in milliseconds
    const epochDuration = Number(config?.epoch_config?.duration) / 1_000_000

    // Calculate the timestamp of the given epoch
    const givenTimestamp =
      startTime.valueOf() + ((givenEpoch - currentEpoch) * epochDuration)

    // Convert the timestamp to a dayjs instance in local time
    const givenEpochDate = dayjs(givenTimestamp).local()

    // Return the formatted date for the given epoch
    return givenEpochDate.format('YYYY/MM/DD')
  }

  const currentEpoch = useMemo(() => {
    if (!data?.epoch?.id) {
      return null
    }

    return Number(data?.epoch?.id)
  }, [data])
  return {
    dateToEpoch,
    epochToDate,
    currentEpoch,
  }
}

export default useEpoch
