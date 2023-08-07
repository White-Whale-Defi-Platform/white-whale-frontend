export const ACTIVE_NETWORKS = {
  mainnet: {
    chihuahua: 'chihuahua-1',
    comdex: 'comdex-1',
    injective: 'injective-1',
    juno: 'juno-1',
    migaloo: 'migaloo-1',
    terra: 'phoenix-1',
  },
  testnet: {
    comdex: 'comdex-test2',
    injective: 'injective-888',
    juno: 'uni-6',
    narwhal: 'narwhal-1',
    terra: 'pisco-1',
  },
}

export const ACTIVE_BONDING_NETWORKS = [
  'chihuahua-1',
  'juno-1',
  'migaloo-1',
  'narwhal-1',
  'phoenix-1',
]
export const ACTIVE_INCENTIVE_NETWORKS = [
  'chihuahua-1',
  'juno-1',
  'migaloo-1',
  'narwhal-1',
  'phoenix-1',
]

export const MAINNET_TESTNET_MAP = {
  'migaloo-1': 'narwhal-1',
  'narwhal-1': 'migaloo-1',
  'phoenix-1': 'pisco-1',
  'pisco-1': 'phoenix-1',
}

export const NETWORK_MAP = {
  mainnet: 'testnet',
  testnet: 'mainnet',
}
