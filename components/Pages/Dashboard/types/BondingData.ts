import { ActionType, TokenType } from '../BondingOverview'
import { TokenBalance } from 'components/Pages/BondingActions/Bond'

export type BondingData = {
  color: string
  actionType: ActionType
  tokenType: TokenType
  value: number
  tokenBalances: TokenBalance[]
  label: string
}
