export const DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL = 15000
export const DEFAULT_REFETCH_ON_WINDOW_FOCUS_STALE_TIME = 60000

export const POOL_REWARDS_ENABLED = JSON.parse(process.env.NEXT_PUBLIC_ENABLE_FEATURE_REWARDS)

export const STABLE_COIN_LIST = ['CMST', 'USDT', 'axlUSDC']

export const POOL_INFO_BASE_URL =
  'https://www.api-white-whale.enigma-validator.com/summary'

export const COSMOS_KIT_WALLET_KEY = 'cosmos-kit@2:core//current-wallet'
