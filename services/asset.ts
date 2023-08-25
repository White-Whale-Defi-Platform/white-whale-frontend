import { AssetInfo, CW20AssetInfo, NativeAssetInfo } from 'types'

export function isNativeAssetInfo(value: NativeAssetInfo | CW20AssetInfo): value is NativeAssetInfo {
  return value.hasOwnProperty('native_token')
}

export const isNativeToken = (token?: string): boolean => (token ? token.startsWith('u') || token.includes('factory' || 'ibc') : false)

export const isNativeAsset = (info: AssetInfo): boolean => 'native_token' in info

export const toAssetInfo = (token: string, isNative: boolean): AssetInfo => {
  if (isNative) {
    return { native_token: { denom: token } }
  }

  return { token: { contract_addr: token } }
}

type ToAssetOpts = {
  amount: string
  token: string
  isNative: boolean
}

export const toAsset = ({ amount, token, isNative }: ToAssetOpts) => ({
  amount,
  info: toAssetInfo(token, isNative),
})

export const findAsset = (infos: AssetInfo[], token: string) => {
  const asset = infos.find((info) => {
    if (isNativeAssetInfo(info)) {
      return info.native_token.denom === token
    }

    return info.token.contract_addr === token
  })

  if (!asset) {
    return null
  }

  return asset
}

export const createAsset = (
  amount: string, token: string, isNative,
) => {
  const info = toAssetInfo(token, isNative)

  return {
    info,
    amount,
  }
}

export const getTokenDenom = (info: AssetInfo): string => {
  if (isNativeAssetInfo(info)) {
    return info.native_token.denom
  }

  return info.token.contract_addr
}

export const getTokenDenoms = (infos: AssetInfo[]): string[] => infos.map((info) => getTokenDenom(info))
