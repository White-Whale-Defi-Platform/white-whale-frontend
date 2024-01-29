import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import axios from 'axios'
import { chains as chainRegistry } from 'chain-registry'
import { ChainId, WALLET_CHAIN_NAMES_BY_CHAIN_ID } from 'constants/'
import { getGasPrices } from 'constants/signerOptions'
import chains from 'public/mainnet/chain_info.json'
import { aggregateAndSortTaxAmounts } from 'util/conversion/numberUtil'

import { getGasPricesAPI } from './useAPI'

export const getGasFees = async (
  gas: number, price: number, denom: string,
) => ({
  amount: [
    {
      denom,
      amount: String(Math.ceil(Number(gas * price))),
    },
  ],
  gas: String(gas),
})

export async function createGasFee(
  client: SigningCosmWasmClient | InjectiveSigningStargateClient, address: string, msgs: Array<any>,
) {
  const chainId = await client.getChainId()
  const prices = await getGasPricesAPI()
  const outGas = Math.ceil(await client.simulate(
    address, msgs, '',
  ) * 1.3)
  let chainFee = prices[WALLET_CHAIN_NAMES_BY_CHAIN_ID[chainId]]
  if (!chainFee) {
    const chainEntry = chainRegistry.find((chain: any) => chain.chain_name === WALLET_CHAIN_NAMES_BY_CHAIN_ID[chainId])
    chainFee = await getGasPrices(WALLET_CHAIN_NAMES_BY_CHAIN_ID[chainId], chainEntry)
  }
  if (chainId === ChainId.terrac) {
    const funds = msgs.flatMap((elem) => elem.value.funds)
    return await TerraTreasuryService.getInstance().getTerraClassicFee(funds, outGas)
  }
  return getGasFees(
    outGas, chainFee.amount, chainFee.denom,
  )
}

class FCDBaseClient {
  private readonly baseURL: string = 'https://terra-classic-lcd.publicnode.com/terra'

  // Private constructor so it cannot be instantiated directly.
  constructor() {
  }

  protected async get(endpoint: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/${endpoint}`)
      return response.data
    } catch (error) {
      throw new Error(`Error fetching data from ${endpoint}. Error: ${error}`)
    }
  }
}

export class TerraTreasuryService extends FCDBaseClient {
  private static instance: TerraTreasuryService

  private taxRate: number
  // Private taxCap: Record<string, string>;

  // Private constructor so it cannot be instantiated directly.
  constructor() {
    super()
  }

  // Public method to get the unique instance.
  public static getInstance(): TerraTreasuryService {
    if (!this.instance) {
      this.instance = new TerraTreasuryService()
    }
    return this.instance
  }

  async getTerraTax(amount: number | string): Promise<any> {
    if (!amount) {
      return 0
    }
    const taxRate = this.taxRate || (await this.getTaxRate())
    const taxCap = '60000000000000000' // This.taxCap?.[denom] || (await this.getTaxCap(denom));
    /*
     *If(taxCap===''){
     *return Math.ceil(+amount * +taxRate)
     *}
     */
    return Math.ceil(Math.min(Number(amount) * Number(taxRate), Number(taxCap)))
  }

  async getTerraClassicFee(funds: any, gas: number): Promise<any> {
    const terraClassic = chains.find((chain) => chain.chainId === ChainId.terrac);
    let tax = null;
    const amountClassic = funds?.reduce((total, elem) => {
      if (elem.denom === terraClassic.stakeCurrency.coinMinimalDenom) {
        return total + Number(elem.amount)
      }
      return total
    }, 0)
    if (amountClassic > 0) {
      tax = await this.getTerraTax(amountClassic);
    }

    const amounts = [];
    if (tax) {
      amounts.push({
        denom: terraClassic.stakeCurrency.coinMinimalDenom,
        amount: tax.toString(),
      });
    }
    amounts.push({
      denom: terraClassic.stakeCurrency.coinMinimalDenom,
      amount: (Math.ceil(Number(terraClassic.gasPriceStep.average) * gas)).toString(),
    });

    const feeResult = {
      amount: aggregateAndSortTaxAmounts(amounts),
      gas: String(gas),
    };

    return feeResult;
  }

  private async getTaxRate(): Promise<any> {
    const response = await this.get('treasury/v1beta1/tax_rate')
    return response?.tax_rate
  }

  /*
   *  Private async getTaxCap(denom: string): Promise<any> {
   *  const response = await this.get(`treasury/tax_cap/${denom}`);
   *  return response?.result;
   *  }
   */
}
