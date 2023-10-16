import { AssetInfo } from 'types/index'

export const isNativeToken = (token?: string): boolean => (token ? token.startsWith('u') || token.includes('factory' || 'ibc') : false)
export const toAssetInfo = (token: string, isNative: boolean): AssetInfo => {
  if (isNative) {
    return { native_token: { denom: token } }
  }

  return { token: { contract_addr: token } }
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
