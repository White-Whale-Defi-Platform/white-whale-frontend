import axios from 'axios'
import chains from 'public/mainnet/chain_info.json'
import { aggregateAndSortTaxAmounts } from 'util/conversion/index'
import columbusConfig from 'public/mainnet/columbus-5/config.json'
import rebelConfig from 'public/testnet/rebel-2/config.json'

class FCDBaseClient {
  private readonly baseURL: string = 'https://fcd.terra.dev'

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

  async getTerraClassicFee(amount: number | string, denom: string): Promise<any> {
    const terraClassic = chains.find((chain) => chain.chainId === 'columbus-5')
    const tax = await this.getTerraTax(amount)
    const amounts = [{
      denom,
      amount: tax.toString()
    },
      {
        denom: terraClassic.stakeCurrency.coinMinimalDenom,
        amount: (Number(terraClassic.gasPriceStep.average) * 10 ** 6).toString()
      }
    ]
    return {
      amount: aggregateAndSortTaxAmounts(amounts),
      gas: '1000000'
    }
  }

  async getTerraClassicIncentiveFee(amount: number | string, denom: string): Promise<any> {
    const terraClassic = chains.find((chain) => chain.chainId === 'columbus-5')
    const tax = await this.getTerraTax(amount)
    const whaleTax = await this.getTerraTax('1000000000')
    const amounts = [{
      denom,
      amount: tax.toString()
    },
      {
        denom: columbusConfig.whale_base_token.denom,
        amount: whaleTax.toString()
      },
      {
        denom: terraClassic.stakeCurrency.coinMinimalDenom,
        amount: (Number(terraClassic.gasPriceStep.average) * 10 ** 6).toString()
      }
    ]
    return {
      amount: aggregateAndSortTaxAmounts(amounts),
      gas: '1000000'
    }
  }

  async getTerraClassicFeeForDeposit(
    amountA: number | string, denomA: string, amountB: number | string, denomB: string
  ): Promise<any> {
    const terraClassic = chains.find((chain) => chain.chainId === 'columbus-5')
    const taxA = await this.getTerraTax(amountA)
    const taxB = await this.getTerraTax(amountB)
    const amounts = [
      {
        denom: denomA,
        amount: taxA.toString()
      },
      {
        denom: denomB,
        amount: taxB.toString()
      },
      {
        denom: terraClassic.stakeCurrency.coinMinimalDenom,
        amount: (Number(terraClassic.gasPriceStep.average) * 10 ** 6).toString()
      }
    ]

    return {
      amount: aggregateAndSortTaxAmounts(amounts),
      gas: '1000000'
    }
  }

  private async getTaxRate(): Promise<any> {
    const response = await this.get('treasury/tax_rate')
    return response?.result
  }

  /*
   *  Private async getTaxCap(denom: string): Promise<any> {
   *  const response = await this.get(`treasury/tax_cap/${denom}`);
   *  return response?.result;
   *  }
   */
}
