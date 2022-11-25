export type CW20AssetInfo = { token: { contract_addr: string } }
export type NativeAssetInfo = { native_token: { denom: string } }

export type AssetInfo = CW20AssetInfo | NativeAssetInfo

export type CW20Asset = {
  amount: string
  info: CW20AssetInfo
}
export type NativeAsset = {
  amount: string
  info: NativeAssetInfo
}

export type Asset = CW20Asset | NativeAsset

export type Pair = {
  pair: {
    asset_infos: [AssetInfo, AssetInfo]
  }
}

export type PairResponse = {
  asset_infos: [AssetInfo, AssetInfo]

  /** Pair contract address */
  contract_addr: string

  /** LP contract address (not lp minter cw20 token) */
  liquidity_token: string
}

// ---------------------------------------------
// HandleMsg
// ---------------------------------------------
export type ProvideLiquidity = {
  provide_liquidity: {
    assets: [Asset, Asset]
    slippage_tolerance?: string
    receiver?: string
  }
}

export type Swap = {
  swap: {
    belief_price?: string
    max_spread?: string
    to?: string
  }
}

// ---------------------------------------------
// CW20HookMsg
// ---------------------------------------------
export type SwapHook = {
  swap: {
    belief_price?: string
    max_spread?: string
    to?: string
  }
}

// ---------------------------------------------
// QueryMsg
// ---------------------------------------------
export type Pool = {
  pool: {}
}

export type PoolResponse = {
  total_share: string
  assets: [Asset, Asset]
}

export type Simulation = {
  simulation: {
    offer_asset: {
      info: AssetInfo
      amount: string
    }
  }
}

export type SimulationResponse = {
  commission_amount: string
  return_amount: string
  spread_amount: string
}

export type ReverseSimulation = {
  reverse_simulation: {
    ask_asset: {
      info: AssetInfo
      amount: string
    }
  }
}

export type ReverseSimulationResponse = {
  commission_amount: string
  offer_amount: string
  spread_amount: string
}

export type MultiSimulationResponse = {
  amount: string
}

export type NativeSwapOperation = {
  native_swap: {
    offer_denom: string
    ask_denom: string
  }
}

export type CW20SwapOperation = {
  terra_swap: {
    offer_asset_info: AssetInfo
    ask_asset_info: AssetInfo
  }
}

export type SwapOperation = NativeSwapOperation | CW20SwapOperation
