import { useMemo } from 'react'
import { useQuery } from 'react-query'

import {
  Config,
  useConfig,
} from 'components/Pages/Dashboard/hooks/useDashboardData'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
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
  const { client, network, chainId } = useRecoilValue(walletState)
  const contracts: Config = useConfig(network, chainId)

  const { data: config } = useQuery<EpochConfigData>({
    queryKey: ['incentive', 'config', contracts?.fee_distributor],
    queryFn: async () => await client?.queryContractSmart(contracts?.fee_distributor, {
      config: {},
    }),
    enabled: Boolean(contracts) && Boolean(client),
  })

  const { data } = useQuery<EpochData>({
    queryKey: ['incentive', 'epoch', contracts?.fee_distributor],
    queryFn: async () => await client?.queryContractSmart(contracts?.fee_distributor, {
      current_epoch: {},
    }),
    enabled: Boolean(contracts) && Boolean(client),
  })

  const checkLocalAndUTC = () => {
    // Get the current local date
    const currentLocalDate = dayjs()

    // Get the current UTC date
    const currentUTCDate = dayjs().utc()

    // Check if local date is still the same and UTC date is one day forward
    const isSameLocalDate = currentUTCDate.isSame(dayjs(), 'day')
    // Const isUTCOneDayForward = currentUTCDate.isAfter(currentLocalDate.add(1, 'day'), 'day');

    // Get yesterday's date
    const yesterday = currentUTCDate.subtract(1, 'day')

    return isSameLocalDate ? yesterday : currentLocalDate
  }

  const dateToEpoch = (givenDate) => {
    if (!data?.epoch?.id || !config?.epoch_config?.duration || !givenDate) {
      return null
    }

    const epochStartTimeInMillis = Number(data?.epoch?.start_time) / 1_000_000
    const epochDurationInMillis =
      Number(config?.epoch_config?.duration) / 1_000_000
    const currentEpoch = Number(data?.epoch?.id)

    const now = dayjs().utc()

    // Convert the epoch start time to a dayjs instance in UTC
    const startTime = dayjs.utc(epochStartTimeInMillis)

    // Convert the given date to a dayjs instance in local time
    const givenDateTime = dayjs(givenDate).utc()

    // Const timestampDiffNew = givenDateTime.valueOf() - now.valueOf();
    const timestampDiffNew = givenDateTime.diff(now, 'millisecond')

    // Calculate the timestamp difference between the given date and epoch start time
    const timestampDiff = givenDateTime.valueOf() - startTime.valueOf()

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
      startTime.valueOf() + (givenEpoch - currentEpoch) * epochDuration

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
