import { protectAgainstNaN } from 'junoblocks'

import {Wallet} from "../../util/wallet-adapters";

type QueryLiquidityBalanceArgs = {
  address: string
  tokenAddress: string
  client: Wallet
}

export const queryLiquidityBalance = async ({
  client,
  tokenAddress,
  address,
}: QueryLiquidityBalanceArgs) => {
  try {
    const query = await client.queryContractSmart(tokenAddress, {
      balance: { address },
    })

    return protectAgainstNaN(Number(query.balance))
  } catch (e) {
    console.error('Cannot get liquidity balance:', e)
  }
}
