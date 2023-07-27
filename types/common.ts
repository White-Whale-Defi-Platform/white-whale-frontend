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
