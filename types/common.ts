export enum TxStep {
  /**
   * Idle
   */
  Idle = 0,
  /**
   * Estimating fees
   */
  Estimating = 1,
  /**
   * Ready to post transaction
   */
  Ready = 2,
  /**
   * Signing transaction in Terra Station
   */
  Posting = 3,
  /**
   * Broadcasting
   */
  Broadcasting = 4,
  /**
   * Succesful
   */
  Success = 5,
  /**
   * Failed
   */
  Failed = 6,
}

export type Token = {
  protocol: string
  symbol: string
  token: string
  icon: string
}

export type Tokens = {
  [token: string]: Token
}

export type TokenItemState = {
  tokenSymbol: string
  amount: number
  decimals: number
}

export type Asset = {
  asset: string
  icon: string
  contract: string
  amount: string | number
  balance: number
}

export type CW20AssetInfo = { token: { contract_addr: string } }
export type NativeAssetInfo = { native_token: { denom: string } }

export type AssetInfo = CW20AssetInfo | NativeAssetInfo

