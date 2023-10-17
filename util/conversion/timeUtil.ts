import { useEffect, useState } from 'react'

export const nanoToMilli = (nano: number) => nano / 1_000_000

export const useCalculateRewardDurationString = (durationInMilli: number,
  genesisStartTimeInNano: number): string => {
  const [isImminent, setImminent] = useState<boolean>(false)
  const nowInMilli = Date.now()
  const adjustedDurationInMilli =
    nanoToMilli(genesisStartTimeInNano) > nowInMilli
      ? nanoToMilli(genesisStartTimeInNano) - nowInMilli
      : durationInMilli

  useEffect(() => {
    if (adjustedDurationInMilli <= 1_000) {
      setImminent(true)
    } else {
      setImminent(false)
    }
  }, [adjustedDurationInMilli])

  if (isImminent) {
    return 'imminent'
  } else if (adjustedDurationInMilli >= 86_400_000) {
    const days = Math.floor(adjustedDurationInMilli / 86_400_000)
    return days === 1 ? `${days} day` : `${days} days`
  } else if (adjustedDurationInMilli >= 3_600_000) {
    const hours = Math.floor(adjustedDurationInMilli / 3_600_000)
    return hours === 1 ? `${hours} hour` : `${hours} hours`
  } else if (adjustedDurationInMilli >= 60_000) {
    const minutes = Math.floor(adjustedDurationInMilli / 60_000)
    return minutes === 1 ? `${minutes} minute` : `${minutes} minutes`
  } else if (adjustedDurationInMilli > 1_000) {
    const seconds = Math.floor(adjustedDurationInMilli / 1_000)
    return seconds === 1 ? `${seconds} second` : `${seconds} seconds`
  } else {
    return ''
  }
}

export const calculateDurationString = (durationInMilli: number): string => {
  if (durationInMilli >= 86_400_000) {
    const days = Math.floor(durationInMilli / 86_400_000)
    return days === 1 ? `${days} day` : `${days} days`
  } else if (durationInMilli >= 3_600_000) {
    const hours = Math.floor(durationInMilli / 3_600_000)
    return hours === 1 ? `${hours} hour` : `${hours} hours`
  } else if (durationInMilli >= 60_000) {
    const minutes = Math.floor(durationInMilli / 60_000)
    return minutes === 1 ? `${minutes} minute` : `${minutes} minutes`
  } else if (durationInMilli > 1_000) {
    const seconds = Math.floor(durationInMilli / 1_000)
    return seconds === 1 ? `${seconds} second` : `${seconds} seconds`
  }
  return 'imminent'
}
