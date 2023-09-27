import { Chain } from '@chain-registry/types'
import { GasPrice } from '@cosmjs/stargate'
import { SignerOptions } from '@cosmos-kit/core'

const prices = (chainName:string, chain:Chain) => {
  const activeChains = ['migaloo', 'terra', 'terra2', 'juno', 'chihuahua', 'comdex', 'injective', 'sei']
  if (activeChains.includes(chainName)) {
    return {
      gasPrice: GasPrice.fromString(String(chain.fees.fee_tokens[0].average_gas_price) + chain.fees.fee_tokens[0].denom),
    }
  }
}
export const signerOptions: SignerOptions = {
  signingCosmwasm: (chain: Chain) => prices(chain.chain_name, chain),
  signingStargate: (chain: Chain) => prices(chain.chain_name, chain),
}
