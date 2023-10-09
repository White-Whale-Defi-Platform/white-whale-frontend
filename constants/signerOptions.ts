import { Chain } from '@chain-registry/types'
import { GasPrice } from '@cosmjs/stargate'
import { SignerOptions } from '@cosmos-kit/core'

import { ACTIVE_NETWORKS_WALLET_NAMES } from './networks'

const prices = (chainName:string, chain:Chain) => {
  const activeChains = [...ACTIVE_NETWORKS_WALLET_NAMES.mainnet, ...ACTIVE_NETWORKS_WALLET_NAMES.testnet]
  if (activeChains.includes(chainName)) {
    const [feeTokens] = chain.fees.fee_tokens;
    const price = feeTokens
      ? feeTokens.fixed_min_gas_price || feeTokens.low_gas_price || feeTokens.average_gas_price || 0
      : 0;
    return {
      gasPrice: GasPrice.fromString(String(price) + chain.fees.fee_tokens[0].denom),
    }
  }
}
export const signerOptions: SignerOptions = {
  signingCosmwasm: (chain: Chain) => prices(chain.chain_name, chain),
  signingStargate: (chain: Chain) => prices(chain.chain_name, chain),
}
