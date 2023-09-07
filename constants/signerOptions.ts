import { SignerOptions } from '@cosmos-kit/core'
import { Chain } from '@chain-registry/types'
import { GasPrice } from '@cosmjs/stargate'

export const signerOptions: SignerOptions = {
  signingCosmwasm: (chain: Chain) => {
    switch (chain.chain_name) {
      case 'migaloo':
        return {
          gasPrice: GasPrice.fromString('0.05uwhale'),
        }
      case 'terra':
        return {
          gasPrice: GasPrice.fromString('0.015uluna'),
        }
      case 'juno':
        return {
          gasPrice: GasPrice.fromString('0.0025ujuno'),
        }
      case 'chihuahua':
        return {
          gasPrice: GasPrice.fromString('1uhuahua'),
        }
      case 'comdex':
        return {
          gasPrice: GasPrice.fromString('0.5ucmdx'),
        }
      case 'injective':
        return {
          gasPrice: GasPrice.fromString('50000000000inj'),
        }
    }
  },
}
