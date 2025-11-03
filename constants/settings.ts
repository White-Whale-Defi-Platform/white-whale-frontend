export const DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL = 15000
export const DEFAULT_REFETCH_ON_WINDOW_FOCUS_STALE_TIME = 60000

export const POOL_REWARDS_ENABLED = JSON.parse(process.env.NEXT_PUBLIC_ENABLE_FEATURE_REWARDS)

export const STABLE_COIN_LIST = ['CMST', 'USDT', 'axlUSDC']

// Optional external API URLs - set to empty array to disable external API features
export const API_URLS: string[] = ['https://ww-api.backbonelabs.io']

export const COSMOS_KIT_WALLET_KEY = 'cosmos-kit@2:core//current-wallet'

export const ADV_MEMO = 'app.whitewhale.money'
