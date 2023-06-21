import { num } from 'libs/num'
import { Pool } from 'types'

import { Wallet } from 'util/wallet-adapters'

export interface GetToken1ForToken2PriceInput {
  swapAddress: string
  client: Wallet
}

export const getToken1ForToken2Price = async ({
  swapAddress,
  client,
}: GetToken1ForToken2PriceInput) => {
  //TODO make sure client is initialized to avoid type error in console
  try {
    const { assets } = await client.queryContractSmart(swapAddress, {
      pool: {},
    })
    const [asset1, asset2] = assets
    return num(asset2.amount).div(asset1.amount).toNumber()
  } catch (e) {
    console.error('err(getToken1ForToken2Price):', e)
  }
}

export interface GetToken2ForToken1PriceInput {
  swapAddress: string
  client: Wallet
}

export const getToken2ForToken1Price = async ({
  swapAddress,
  client,
}: GetToken2ForToken1PriceInput) => {
  try {
    const { assets } = await client.queryContractSmart(swapAddress, {
      pool: {},
    })
    const [asset1, asset2] = assets
    return num(asset1.amount).div(asset2.amount).toNumber()
  } catch (e) {
    console.error('err(getToken2ForToken1Price):', e)
  }
}

export interface GetTokenForTokenPriceInput {
  tokenAmount: number
  swapAddress: string
  outputSwapAddress: string
  client: Wallet
}

export const getTokenForTokenPrice = async (
  input: GetTokenForTokenPriceInput
) => {
  try {
    return getToken1ForToken2Price({
      swapAddress: input.outputSwapAddress,
      client: input.client,
    })
  } catch (e) {
    console.error('error(getTokenForTokenPrice)', e)
  }
}

export type InfoResponse = {
  total_share: string
  lp_token_address: string
  token1_denom: string
  token1_reserve: string
  token2_denom: string
  token2_reserve: string
}

export const getSwapInfo = async (
  swapAddress: string,
  client: Wallet
): Promise<Pool> => {
  try {
    if (!swapAddress || !client) {
      throw new Error(
        `No swapAddress or rpcEndpoint was provided: ${JSON.stringify({
          swapAddress,
          client,
        })}`
      )
    }

    return await client.queryContractSmart(swapAddress, {
      pool: {},
    })
  } catch (e) {
    console.error('Cannot get swap info:', e)
  }
}
