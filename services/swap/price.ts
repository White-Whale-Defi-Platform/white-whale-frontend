import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { num } from 'libs/num'

export interface GetToken1ForToken2PriceInput {
  swapAddress: string
  cosmWasmClient: CosmWasmClient
}

export const getToken1ForToken2Price = async ({
  swapAddress,
  cosmWasmClient,
}: GetToken1ForToken2PriceInput) => {
  // TODO make sure client is initialized to avoid type error in console

  try {
    const { assets } = await cosmWasmClient.queryContractSmart(swapAddress, {
      pool: {},
    })
    const [asset1, asset2] = assets
    return num(asset2.amount).div(asset1.amount).
      toNumber()
  } catch (e) {
    console.error('err(getToken1ForToken2Price):', e)
    return null
  }
}

export interface GetToken2ForToken1PriceInput {
  swapAddress: string
  cosmWasmClient: CosmWasmClient
}

export const getToken2ForToken1Price = async ({
  swapAddress,
  cosmWasmClient,
}: GetToken2ForToken1PriceInput) => {
  try {
    const { assets } = await cosmWasmClient.queryContractSmart(swapAddress, {
      pool: {},
    })
    const [asset1, asset2] = assets
    return num(asset1.amount).div(asset2.amount).
      toNumber()
  } catch (e) {
    console.error('err(getToken2ForToken1Price):', e)
    return null
  }
}

export interface GetTokenForTokenPriceInput {
  tokenAmount: number
  swapAddress: string
  outputSwapAddress: string
  cosmWasmClient: CosmWasmClient
}

export const getTokenForTokenPrice = async (input: GetTokenForTokenPriceInput) => {
  try {
    return await getToken1ForToken2Price({
      swapAddress: input.outputSwapAddress,
      cosmWasmClient: input.cosmWasmClient,
    })
  } catch (e) {
    console.error('error(getTokenForTokenPrice)', e)
    return null
  }
}

export type PoolInfoResponse = {
  total_share: string
  lp_token_address: string
  assets: any
}

export const getPoolInfo = async (swapAddress: string,
  client: CosmWasmClient): Promise<PoolInfoResponse> => {
  if (!swapAddress || !client) {
    return null
  }
  return await client.queryContractSmart(swapAddress, {
    pool: {},
  })
}
