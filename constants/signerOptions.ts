import { Chain } from '@chain-registry/types'
import { GasPrice } from '@cosmjs/stargate'

import { CHAIN_NAMES } from './networks'

export const getGasPrices = async (chainName:string, chain:Chain) => {
  if (CHAIN_NAMES.includes(chainName)) {
    const [feeTokens] = chain.fees.fee_tokens;
    const price = feeTokens
      ? feeTokens?.low_gas_price || feeTokens?.fixed_min_gas_price || feeTokens?.average_gas_price || 0
      : 0;
    return {
      gasPrice: GasPrice.fromString(String(price) + chain.fees.fee_tokens[0]?.denom),
    }
  }
}
export const signerOptions = {
  signingCosmwasm: (chain: Chain) => getGasPrices(chain.chain_name, chain),
  signingStargate: (chain: Chain) => getGasPrices(chain.chain_name, chain),
}
