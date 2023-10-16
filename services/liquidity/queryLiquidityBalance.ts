import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { protectAgainstNaN } from 'util/conversion/index'

type QueryLiquidityBalanceArgs = {
  address: string
  tokenAddress: string
  cosmWasmClient: CosmWasmClient
  isNative: boolean
}

export const queryLiquidityBalance = async ({
  cosmWasmClient,
  tokenAddress,
  address,
  isNative = false,
}: QueryLiquidityBalanceArgs) => {
  let balance = 0
  try {
    if (isNative) {
      balance = Number((await cosmWasmClient.getBalance(address, tokenAddress)).amount)
    } else {
      balance = Number((
        await cosmWasmClient.queryContractSmart(tokenAddress, {
          balance: { address },
        })
      ).balance)
    }

    return protectAgainstNaN(balance)
  } catch (e) {
    console.error('Cannot get liquidity balance:', e)
    return null
  }
}
