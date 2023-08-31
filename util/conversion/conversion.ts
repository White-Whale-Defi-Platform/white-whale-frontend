import { useEffect, useState } from 'react'

export const protectAgainstNaN = (value: number) => (isNaN(value) ? 0 : value)

export function convertMicroDenomToDenom(value: number | string,
  decimals: number): number {
  if (decimals === 0) {
    return Number(value)
  }

  return protectAgainstNaN(Number(value) / 10 ** decimals)
}

export function convertDenomToMicroDenom(value: number | string,
  decimals: number): number {
  if (decimals === 0) {
    return Number(value)
  }

  return protectAgainstNaN(parseInt(String(Number(value) * 10 ** decimals), 10))
}

export function convertFromMicroDenom(denom: string) {
  return denom?.substring(1).toUpperCase()
}

export function convertToFixedDecimals(value: number | string): string {
  const amount = Number(value)
  return amount > 0.01 ? amount.toFixed(2) : String(amount)
}

export const formatTokenName = (name: string) => {
  if (name) {
    return name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase()
  }
  return ''
}
export const calculateRewardDurationString = (durationInMilli: number,
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
export const nanoToMilli = (nano: number) => nano / 1_000_000


export const aggregateTaxAmounts = (amounts: { denom: string, amount: string }[])=>amounts.reduce((acc, cur) => {
    const existingAmount = acc.find((a) => a.denom === cur.denom);
    if (existingAmount) {
      existingAmount.amount = (parseFloat(existingAmount.amount) + parseFloat(cur.amount)).toString();
    } else {
      acc.push(cur);
    }
    return acc;
  }, [] as { denom: string, amount: string }[]);

