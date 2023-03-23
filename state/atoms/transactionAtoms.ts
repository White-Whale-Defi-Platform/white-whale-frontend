import { atom } from 'recoil'

export enum TransactionStatus {
  IDLE = '@transaction-status/idle',
  EXECUTING = '@transaction-status/executing',
  REJECTED = '@transaction-status/rejected',
  SUCCESSFUL = '@transaction-status/successful',
}

export const transactionStatusState = atom<TransactionStatus>({
  key: 'transactionState',
  default: TransactionStatus.IDLE,
})
