import { protectAgainstNaN } from 'junoblocks'
import { Wallet } from 'util/wallet-adapters'

type QueryLiquidityBalanceArgs = {
  address: string
  tokenAddress: string
  client: Wallet
  isNative: boolean
}

export const queryLiquidityBalance = async ({
  client,
  tokenAddress,
  address,
  isNative = false,
}: QueryLiquidityBalanceArgs) => {
  let balance = 0
  try {
    if (isNative) {
      balance = Number((await client.getBalance(address, tokenAddress)).amount)
    } else {
      balance = Number(
        (
          await client.queryContractSmart(tokenAddress, {
            balance: { address },
          })
        ).balance
      )
    }

    return protectAgainstNaN(balance)
  } catch (e) {
    console.error('Cannot get liquidity balance:', e)
  }
}
