import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { useGetTokenDollarValueQuery } from './useGetTokenDollarValueQuery'

export type InternalQueryContext = {
  cosmWasmClient: CosmWasmClient
  getTokenDollarValue: ReturnType<typeof useGetTokenDollarValueQuery>[0]
}
