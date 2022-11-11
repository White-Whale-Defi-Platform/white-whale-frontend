---
name: New Chain deployment request or pool deployment
about: Suggest a new chain for White Whale to deploy its contracts on and to have an associated frontend integration for. Alternatively suggest new pools for an existing chain
title: ''
labels: 'enhancement'
assignees: ''
---

<!-- Thank you for using White Whale Migaloo!

     If you are looking for support, please check out our documentation
     or consider asking a question on Discord's smart contract or contributors channel:
      * https://whitewhale.money/
      * https://white-whale-defi-platform.github.io/docs/
      * https://discordapp.com/channels/908044702794801233/987301947440767006

     If you have found a bug or if our documentation doesn't have an answer
     to what you're looking for, then fill out the template below.
-->

## Chain or Pools

Relevant Info:

- A new chains information is added in `chain_info.json`
- A new pools information is added in `public/mainnet/<chain>-1/pools_list.json`
- A new vaults information is added in `public/mainnet/<chain>-1/vaults_list.json`

Currently the frontend supports or in the past has been able to support 6 and then both 6 and 18 decimal tokens.
If your desired token has a different number of decimals there may need to be an additional change needed. For the most part this should be fine.

<!--
     Please detail what you want to be added to the Migaloo frontend.
     Is it an entirely new chain configuration with a number of pools?
     Is it simply 1 or 2 pools on an existing chain?

     Use this space to describe that with as much details as possible
-->

<!-- For new Chains you wish to see added; a chain's config information looks like so. Please provide as much of this information as you can to avoid searching. With all the below config the frontend can do connections to any given cosmos chain that has the Pools deployed
```json
{
    "chainId": "juno-1",
    "chainName": "Juno Mainnet",
    "label": "Juno",
    "icon": "/logos/juno.svg",
    "rpc": "https://rpc-juno.itastakers.com",
    "rest": "https://lcd-juno.itastakers.com",
    "stakeCurrency": {
      "coinDenom": "JUNO",
      "coinMinimalDenom": "ujuno",
      "coinDecimals": 6
    },
    "bip44": {
      "coinType": 118
    },
    "bech32Config": {
      "bech32PrefixAccAddr": "juno",
      "bech32PrefixAccPub": "junopub",
      "bech32PrefixValAddr": "junovaloper",
      "bech32PrefixValPub": "junovaloperpub",
      "bech32PrefixConsAddr": "junovalcons",
      "bech32PrefixConsPub": "junovalconspub"
    },
    "currencies": [
      {
        "coinDenom": "JUNO",
        "coinMinimalDenom": "ujuno",
        "coinDecimals": 6,
        "coinGeckoId": "juno-network"
      }
    ],
    "feeCurrencies": [
      {
        "coinDenom": "JUNO",
        "coinMinimalDenom": "ujuno",
        "coinDecimals": 6,
        "coinGeckoId": "juno-network"
      }
    ],
    "coinType": 118,
    "gasPriceStep": {
      "low": 0.025,
      "average": 0.05,
      "high": 0.1
    },
    "features": ["cosmwasm"]
  },

``` -->

<!-- For new pools you want to see deployed, provide both information on the assets contained in both pools and which chain it is on this can be in a loosely structured format as below but ideally in JSON.

```
----- Overview

My cool ibc token
- ibc/91532E23037BBEBC1FA05D1D6A79AE3479A4B51A4CABA6C28E15EC24206FD51D
- 18 decimals
- bridged via gravity

My second ibc token
- ibc/B0E35908659CC1C74966C2A868B2A553CBB7E3A6C42A1F3BEA311E3C17FD2181
- 6 decimals
- bridged via gravity

----- Add token

{
  "add_native_token_decimals": {
    "denom": "ibc/91532E23037BBEBC1FA05D1D6A79AE3479A4B51A4CABA6C28E15EC24206FD50F",
    "decimals": 18
  }
}

...

----- Create pair

{
  "create_pair": {
    "asset_infos": [
      {
        "native_token": {
          "denom": "huahua"
        }
      },
      {
        "native_token": {
          "denom": "ibc/91532E23037BBEBC1FA05D1D6A79AE3479A4B51A4CABA6C28E15EC24206FD50F"
        }
      }
    ],
    "pool_fees": {
      "protocol_fee": {
        "share": "0.001"
      },
      "swap_fee": {
        "share": "0.002"
      }
    }
  }
}

...

``` -->

## Proposal

<!--
     Briefly but precisely describe what you would like Migaloo to be able to do.

     Consider attaching something showing what you are imagining:
      * images
      * videos
      * code samples
      * figma designs

     Does this have to be provided by White Whale directly, or can it be provided
     by a third-party contract? If so, maybe consider implementing and
     share it with the community rather than filing a bug.
-->
