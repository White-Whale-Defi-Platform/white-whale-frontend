export const DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL = 15000
export const DEFAULT_REFETCH_ON_WINDOW_FOCUS_STALE_TIME = 60000

export const POOL_REWARDS_ENABLED = JSON.parse(process.env.NEXT_PUBLIC_ENABLE_FEATURE_REWARDS)

export const STABLE_COIN_LIST = ['CMST', 'USDT', 'axlUSDC']

export const ENIGMA_URL = 'https://www.api-white-whale.enigma-validator.com'

export const POOL_INFO_BASE_URL =
  `${ENIGMA_URL}/summary`

export const COSMOS_KIT_WALLET_KEY = 'cosmos-kit@2:core//current-wallet'

export const API_URLS = ['https://fd60qhijvtes7do71ou6moc14s.ingress.pcgameservers.com', 'http://9c0pbpbijhepr6ijm4lk85uiuc.ingress.europlots.com']

export const ADV_MEMO = 'app.whitewhale.money'
