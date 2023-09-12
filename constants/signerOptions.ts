import { Chain } from '@chain-registry/types'
import { GasPrice } from '@cosmjs/stargate'
import { SignerOptions } from '@cosmos-kit/core'

const prices = (chainName:string) => {
  switch (chainName) {
    case 'migaloo':
      return {
        gasPrice: GasPrice.fromString('0.5uwhale'),
      }
    case 'terra':
      return {
        gasPrice: GasPrice.fromString('0.015uluna'),
      }
    case 'terra2':
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
    case 'sei':
      return {
        gasPrice: GasPrice.fromString('0.1usei'),
      }
  }
}
export const signerOptions: SignerOptions = {
  signingCosmwasm: (chain: Chain) => prices(chain.chain_name),
  signingStargate: (chain: Chain) => prices(chain.chain_name),
}
