import {ActionType, TokenType} from "../BondingOverview"

export type BondingData = {
  color: string
  actionType: ActionType
  tokenType: TokenType
  value: number
  whale: number,
  ampWhale: number,
  bWhale: number,
  label: string
}
