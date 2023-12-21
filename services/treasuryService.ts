import axios from 'axios'
import { ChainId } from 'constants/index'
import chains from 'public/mainnet/chain_info.json'
import { aggregateAndSortTaxAmounts } from 'util/conversion/numberUtil'

export const getInjectiveFee = (gas:number) => {
  //hardcoded until native cosmos-kit support
  const fee = {
    amount: [
      {
        denom: 'inj',
        amount: String(gas * 160000000),
      },
    ],
    gas: String(gas),
  };
  return fee
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

  async getTerraClassicFee(funds:any, gas:number): Promise<any> {
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
