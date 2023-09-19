import { useGetTokenDollarValueQuery } from './useGetTokenDollarValueQuery'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

export type InternalQueryContext = {
  cosmWasmClient: CosmWasmClient
  getTokenDollarValue: ReturnType<typeof useGetTokenDollarValueQuery>[0]
}
