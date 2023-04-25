import {useEffect, useState} from "react";

export const protectAgainstNaN = (value: number) => (isNaN(value) ? 0 : value)

export function convertMicroDenomToDenom(
  value: number | string,
  decimals: number
): number {
  if (decimals === 0) return Number(value)

  return protectAgainstNaN(Number(value) / Math.pow(10, decimals))
}

export function convertDenomToMicroDenom(
  value: number | string,
  decimals: number
): number {
  if (decimals === 0) return Number(value)

  return protectAgainstNaN(
    parseInt(String(Number(value) * Math.pow(10, decimals)), 10)
  )
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
export const calculateRewardDurationString = (durationInMilli: number, genesisStartTimeInNano: number): string => {
  const [isImminent, setImminent] = useState<boolean>(false)
  const nowInMilli = Date.now()
  const adjustedDurationInMilli = nanoToMilli(genesisStartTimeInNano) > nowInMilli ?
    nanoToMilli(genesisStartTimeInNano) + 86_000_000 - nowInMilli : durationInMilli

  useEffect(() => {
    if (adjustedDurationInMilli <= 1000) {
      setImminent(true)
    }else{
      setImminent(false)
    }
  }, [adjustedDurationInMilli])

  if (isImminent) {
    return `imminent`;
  } else if (adjustedDurationInMilli >= 86400_000) {
    return `${Math.floor(adjustedDurationInMilli / 86400_000)} days`;
  } else if (adjustedDurationInMilli >= 3600_000) {
    return `${Math.floor(adjustedDurationInMilli / 3600_000)} hours`;
  } else if (adjustedDurationInMilli >= 60_000) {
    return `${Math.floor(adjustedDurationInMilli / 60_000)} minutes`;
  } else if (adjustedDurationInMilli > 1_000) {
    return `${Math.floor(adjustedDurationInMilli / 1_000)} seconds`;
  }
};

export const calculateDurationString = (durationInMilli: number): string => {
  if (durationInMilli >= 86400000) {
    return `${Math.floor(durationInMilli / 86400_000)} days`;
  } else if (durationInMilli >= 3600_000) {
    return `${Math.floor(durationInMilli / 3600_000)} hours`;
  } else if (durationInMilli >= 60_000) {
    return `${Math.floor(durationInMilli / 60_000)} minutes`;
  } else if (durationInMilli > 1_000) {
    return `${Math.floor(durationInMilli / 1_000)} seconds`;
  } else {
    return `imminent`;
  }
};
export const nanoToMilli = (nano: number) => nano/1_000_000;
