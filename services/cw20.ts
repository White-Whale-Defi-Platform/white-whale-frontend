import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { Coin } from '@cosmjs/launchpad'

export type Expiration =
  | { readonly at_height: number }
  | { readonly at_time: number }
  | { readonly never: unknown }

export interface AllowanceResponse {
  readonly allowance: string // Integer as string
  readonly expires: Expiration
}

export interface AllowanceInfo {
  readonly allowance: string // Integer as string
  readonly spender: string // Bech32 address
  readonly expires: Expiration
}

export interface AllAllowancesResponse {
  readonly allowances: readonly AllowanceInfo[]
}

export interface CW20TokenInfo {
  readonly name: string
  readonly symbol: string
  readonly decimals: number
  readonly total_supply: string
}

export interface Investment {
  readonly exit_tax: string
  readonly min_withdrawal: string
  readonly nominal_value: string
  readonly owner: string
  readonly staked_tokens: Coin
  readonly token_supply: string
  readonly validator: string
}

export interface Claim {
  readonly amount: string
  readonly release_at: { readonly at_time: number }
}

export interface Claims {
  readonly claims: readonly Claim[]
}

export interface AllAccountsResponse {
  // List of bech32 address that have a balance
  readonly accounts: readonly string[]
}

export interface CW20Instance {
  readonly contractAddress: string

  // Queries
  balance: (address: string) => Promise<string>
  allowance: (owner: string, spender: string) => Promise<AllowanceResponse>
  allAllowances: (
    owner: string,
    startAfter?: string,
    limit?: number
  ) => Promise<AllAllowancesResponse>
  allAccounts: (
    startAfter?: string,
    limit?: number
  ) => Promise<readonly string[]>
  tokenInfo: () => Promise<CW20TokenInfo>
  investment: () => Promise<Investment>
  claims: (address: string) => Promise<Claims>
  minter: (sender: string) => Promise<any>

  // Actions
  mint: (sender: string, recipient: string, amount: string) => Promise<string>
  transfer: (
    sender: string,
    recipient: string,
    amount: string
  ) => Promise<string>
  burn: (sender: string, amount: string) => Promise<string>
  increaseAllowance: (
    sender: string,
    recipient: string,
    amount: string
  ) => Promise<string>
  decreaseAllowance: (
    sender: string,
    recipient: string,
    amount: string
  ) => Promise<string>
  transferFrom: (
    sender: string,
    owner: string,
    recipient: string,
    amount: string
  ) => Promise<string>
  bond: (sender: string, coin: Coin) => Promise<string>
  unbond: (sender: string, amount: string) => Promise<string>
  claim: (sender: string) => Promise<string>
}

export interface CW20Contract {
  use: (contractAddress: string) => CW20Instance
}

export const CW20 = (cosmWasmClient: CosmWasmClient,
  signingClient: SigningCosmWasmClient): CW20Contract => {
  const use = (contractAddress: string): CW20Instance => {
    const balance = async (address: string): Promise<string> => {
      const result = await cosmWasmClient?.queryContractSmart(contractAddress, {
        balance: { address },
      })
      return result?.balance
    }

    const allowance = async (owner: string,
      spender: string): Promise<AllowanceResponse> => await cosmWasmClient.queryContractSmart(contractAddress, {
      allowance: { owner,
        spender },
    })

    const allAllowances = async (
      owner: string,
      startAfter?: string,
      limit?: number,
    ): Promise<AllAllowancesResponse> => await cosmWasmClient.queryContractSmart(contractAddress, {
      all_allowances: { owner,
        start_after: startAfter,
        limit },
    })

    const allAccounts = async (startAfter?: string,
      limit?: number): Promise<readonly string[]> => {
      const accounts: AllAccountsResponse =
        await cosmWasmClient.queryContractSmart(contractAddress, {
          all_accounts: { start_after: startAfter,
            limit },
        })
      return accounts.accounts
    }
    const tokenInfo = async (): Promise<CW20TokenInfo> => await cosmWasmClient.queryContractSmart(contractAddress, {
      token_info: {},
    })

    const investment = async (): Promise<Investment> => await cosmWasmClient.queryContractSmart(contractAddress, {
      investment: {},
    })

    const claims = async (address: string): Promise<Claims> => await cosmWasmClient.queryContractSmart(contractAddress, {
      claims: { address },
    })
    const minter = async (): Promise<any> => await cosmWasmClient.queryContractSmart(contractAddress, { minter: {} })

    const mint = async (
      sender: string,
      recipient: string,
      amount: string,
    ): Promise<string> => {
      const result = await signingClient.execute(
        sender,
        contractAddress,
        {
          mint: { recipient,
            amount },
        },
        'auto',
      )
      return result.transactionHash
    }

    // Transfers tokens, returns transactionHash
    const transfer = async (
      sender: string,
      recipient: string,
      amount: string,
    ): Promise<string> => {
      const result = await signingClient.execute(
        sender,
        contractAddress,
        {
          transfer: { recipient,
            amount },
        },
        'auto',
      )
      return result.transactionHash
    }

    // Burns tokens, returns transactionHash
    const burn = async (sender: string, amount: string): Promise<string> => {
      const result = await signingClient.execute(
        sender,
        contractAddress,
        {
          burn: { amount },
        },
        'auto',
      )
      return result.transactionHash
    }

    const increaseAllowance = async (
      sender: string,
      spender: string,
      amount: string,
    ): Promise<string> => {
      const result = await signingClient.execute(
        sender,
        contractAddress,
        {
          increase_allowance: { spender,
            amount },
        },
        'auto',
      )
      return result.transactionHash
    }

    const decreaseAllowance = async (
      sender: string,
      spender: string,
      amount: string,
    ): Promise<string> => {
      const result = await signingClient.execute(
        sender,
        contractAddress,
        {
          decrease_allowance: { spender,
            amount },
        },
        'auto',
      )
      return result.transactionHash
    }

    const transferFrom = async (
      sender: string,
      owner: string,
      recipient: string,
      amount: string,
    ): Promise<string> => {
      const result = await signingClient.execute(
        sender,
        contractAddress,
        {
          transfer_from: { owner,
            recipient,
            amount },
        },
        'auto',
      )
      return result.transactionHash
    }

    const bond = async (sender: string, coin: Coin): Promise<string> => {
      const result = await signingClient.execute(
        sender,
        contractAddress,
        { bond: {} },
        'auto',
        null,
        [coin],
      )
      return result.transactionHash
    }

    const unbond = async (sender: string, amount: string): Promise<string> => {
      const result = await signingClient.execute(
        sender,
        contractAddress,
        {
          unbond: { amount },
        },
        'auto',
      )
      return result.transactionHash
    }

    const claim = async (sender: string): Promise<string> => {
      const result = await signingClient.execute(
        sender,
        contractAddress,
        {
          claim: {},
        },
        'auto',
      )
      return result.transactionHash
    }

    return {
      contractAddress,
      balance,
      allowance,
      allAllowances,
      allAccounts,
      tokenInfo,
      investment,
      claims,
      minter,
      mint,
      transfer,
      burn,
      increaseAllowance,
      decreaseAllowance,
      transferFrom,
      bond,
      unbond,
      claim,
    }
  }
  return { use }
}
