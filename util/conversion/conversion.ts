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
export const calculateRewardDurationString = (durationInMilli: number, statusBlock: number): string => {
  const [isImminent, setImminent] = useState<boolean>(false)
  const [block, setBlock] = useState<number>(null)

  useEffect(() => {
    if (block !== null && statusBlock > block && isImminent) {
      setImminent(false)
    }

    setBlock(statusBlock)
  }, [statusBlock])

  useEffect(() => {
    if (durationInMilli <= 1000) {
      setImminent(true)
    }

  }, [durationInMilli])

  if (isImminent) {
    return `imminent`;
  } else if (durationInMilli >= 86400_000) {
    return `${Math.floor(durationInMilli / 86400_000)} days`;
  } else if (durationInMilli >= 3600_000) {
    return `${Math.floor(durationInMilli / 3600_000)} hours`;
  } else if (durationInMilli >= 60_000) {
    return `${Math.floor(durationInMilli / 60_000)} minutes`;
  } else if (durationInMilli > 1_000) {
    return `${Math.floor(durationInMilli / 1_000)} seconds`;
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
