export const ACTIVE_NETWORKS = {
  mainnet: {
    chihuahua: 'chihuahua-1',
    comdex: 'comdex-1',
    injective: 'injective-1',
    juno: 'juno-1',
    migaloo: 'migaloo-1',
    terra: 'phoenix-1',
    sei: 'pacific-1',
    'terra-classic': 'columbus-5',
  },
  testnet: {
    comdex: 'comdex-test2',
    injective: 'injective-888',
    juno: 'uni-6',
    narwhal: 'narwhal-1',
    terra: 'pisco-1',
    sei: 'sei-devnet-1',
    'terra-classic': 'rebel-2',
  },
}

export const ACTIVE_BONDING_NETWORKS = [
  'chihuahua-1',
  'juno-1',
  'migaloo-1',
  'narwhal-1',
  'phoenix-1',
  'pacific-1',
  'columbus-5',
]
export const ACTIVE_INCENTIVE_NETWORKS = [
  'chihuahua-1',
  'juno-1',
  'migaloo-1',
  'narwhal-1',
  'phoenix-1',
  'pacific-1',
  'columbus-5',
]

export const MAINNET_TESTNET_MAP = {
  'migaloo-1': 'narwhal-1',
  'narwhal-1': 'migaloo-1',
  'phoenix-1': 'pisco-1',
  'pisco-1': 'phoenix-1',
  'pacific-1': 'sei-devnet-1',
  'columbus-5': 'rebel-2',
}

export const NETWORK_MAP = {
  mainnet: 'testnet',
  testnet: 'mainnet',
}
