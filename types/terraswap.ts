export type CW20AssetInfo = { token: { contract_addr: string } }
export type NativeAssetInfo = { native_token: { denom: string } }

export type AssetInfo = CW20AssetInfo | NativeAssetInfo

