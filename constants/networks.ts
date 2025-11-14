export const ACTIVE_NETWORKS = {
  mainnet: {
    injective: 'injective-1',
    migaloo: 'migaloo-1',
    terra: 'phoenix-1',
    'terra-classic': 'columbus-5',
    osmosis: 'osmosis-1',
  }
}

export const ACTIVE_NETWORKS_WALLET_NAMES = {
  mainnet: [
    'injective',
    'migaloo',
    'terra2',
    'terra',
    'osmosis',
  ]
}

export const WALLET_CHAIN_NAMES_BY_CHAIN_ID = {
  'injective-1': 'injective',
  'migaloo-1': 'migaloo',
  'phoenix-1': 'terra2',
  'columbus-5': 'terra',
  'rebel-2': 'terra',
  'osmosis-1': 'osmosis'
}

export const ACTIVE_BONDING_NETWORKS = [
  'migaloo-1',
  'phoenix-1',
  'columbus-5',
  'injective-1',
  'osmosis-1'
]
export const ACTIVE_INCENTIVE_NETWORKS = [
  'migaloo-1',
  'phoenix-1',
  'columbus-5',
  'injective-1',
  'osmosis-1',
]

export const MAINNET_TESTNET_CHAIN_ID_MAP = {
  'migaloo-1': 'narwhal-1',
  'narwhal-1': 'migaloo-1',
  'phoenix-1': 'pisco-1',
  'pisco-1': 'phoenix-1',
  'pacific-1': 'sei-devnet-1',
  'columbus-5': 'rebel-2',
}

export const WALLET_CHAIN_NAME_MAINNET_TESTNET_MAP = {
  migalootestnet: 'migaloo',
  terra2testnet: 'terra2',
  terra: 'terra',
  injectivetestnet: 'injective',
}

export const NETWORK_MAP = {
  mainnet: 'testnet',
  testnet: 'mainnet',
}

// Chain names by cosmos kit
export enum WalletChainName { terrac = 'terra', terra = 'terra2', migaloo= 'migaloo', injective= 'injective', osmosis= 'osmosis' }
export const CHAIN_NAMES = [...ACTIVE_NETWORKS_WALLET_NAMES.mainnet]
export enum ChainId { terrac = 'columbus-5', terra = 'phoenix-1', migaloo = 'migaloo-1', injective = 'injective-1', osmosis = 'osmosis-1' }
