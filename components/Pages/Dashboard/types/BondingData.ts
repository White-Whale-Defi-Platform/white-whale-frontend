import { TokenBalance } from 'components/Pages/BondingActions/Bond'

import { ActionType, TokenType } from '../BondingOverview'

export type BondingData = {
  color: string
  actionType: ActionType
  tokenType: TokenType
  value: number
  tokenBalances: TokenBalance[]
  label: string
}
