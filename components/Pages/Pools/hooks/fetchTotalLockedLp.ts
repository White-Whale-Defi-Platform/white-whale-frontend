import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { isNativeToken } from 'services/asset'

export const fetchTotalLockedLp = async (
  incentiveAddress: string,
  lpAddress: string,
  client: CosmWasmClient,
) => {
  if (!client || !incentiveAddress || !lpAddress) {
    return null
  }

  const { balance, amount } = isNativeToken(lpAddress)
    ? await client.getBalance(incentiveAddress, lpAddress)
    : await client.queryContractSmart(lpAddress, {
      balance: { address: incentiveAddress },
    })

  return Number(balance || amount)
}
