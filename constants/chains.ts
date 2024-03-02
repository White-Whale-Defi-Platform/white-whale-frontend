import {
  type Chain,
  type AssetLists,
  migaloo,
  terra2,
  juno,
  chihuahua,
  comdex,
  injective,
  terra,
  sei,
  osmosis,
  migalooAssetList,
  terra2AssetList,
  junoAssetList,
  chihuahuaAssetList,
  comdexAssetList,
  injectiveAssetList,
  terraAssetList,
  seiAssetList,
  osmosisAssetList,
  migalootestnet,
  terra2Testnet,
  junotestnet,
  seitestnet,
  injectivetestnet,
  migalootestnetAssetList,
  terra2TestnetAssetList,
  seitestnetAssetList,
  junotestnetAssetList,
  injectivetestnetAssetList,
} from '@nabla-studio/chain-registry';

export const testnetChains: Chain[] = [
  migalootestnet,
  terra2Testnet,
  seitestnet,
  junotestnet,
  injectivetestnet,
];

export const testnetAssetsLists: AssetLists[] = [
  migalootestnetAssetList,
  terra2TestnetAssetList,
  seitestnetAssetList,
  junotestnetAssetList,
  injectivetestnetAssetList,
];

export const chains: Chain[] = [
  {
    ...migaloo,
    apis: {
      rpc: [
        {
          address: 'https://migaloo-rpc.polkachu.com',
        },
      ],
      rest: [
        {
          address: 'https://migaloo-api.polkachu.com',
        },
      ],
    },
  },
  {
    ...terra2,
    apis: {
      rpc: [
        {
          address: 'https://ww-terra-rpc.polkachu.com',
        },
      ],
      rest: [
        {
          address: 'https://ww-terra-rest.polkachu.com',
        },
      ],
    },
  },
  {
    ...juno,
    apis: {
      rpc: [
        {
          address: 'https://ww-juno-rpc.polkachu.com',
        },
      ],
      rest: [
        {
          address: 'https://ww-juno-rest.polkachu.com',
        },
      ],
    },
  },
  {
    ...chihuahua,
    apis: {
      rpc: [
        {
          address: 'https://ww-chihuahua-rpc.polkachu.com',
        },
      ],
      rest: [
        {
          address: 'https://ww-chihuahua-rest.polkachu.com',
        },
      ],
    },
  },
  {
    ...comdex,
    apis: {
      rpc: [
        {
          address: 'https://rpc.comdex.one',
        },
      ],
      rest: [
        {
          address: 'https://ww-comdex-rest.polkachu.com',
        },
      ],
    },
  },
  {
    ...injective,
    apis: {
      rpc: [
        {
          address: 'https://ww-injective-rpc.polkachu.com',
        },
      ],
      rest: [
        {
          address: 'https://ww-injective-rest.polkachu.com',
        },
      ],
    },
  },
  {
    ...terra,
    apis: {
      rpc: [
        {
          address: 'https://terra-classic-rpc.publicnode.com',
        },
      ],
      rest: [
        {
          address: 'https://terra-classic-lcd.publicnode.com',
        },
      ],
    },
  },
  {
    ...sei,
    apis: {
      rpc: [
        {
          address: 'https://sei-rpc.polkachu.com',
        },
      ],
      rest: [
        {
          address: 'https://sei-api.polkachu.com',
        },
      ],
    },
  },
  {
    ...osmosis,
    apis: {
      rpc: [
        {
          address: 'https://osmosis-rpc.polkachu.com',
        },
      ],
      rest: [
        {
          address: 'https://osmosis-api.polkachu.com',
        },
      ],
    },
  },
];

export const assetsLists: AssetLists[] = [
  migalooAssetList,
  terra2AssetList,
  junoAssetList,
  chihuahuaAssetList,
  comdexAssetList,
  injectiveAssetList,
  terraAssetList,
  seiAssetList,
  osmosisAssetList,
];
