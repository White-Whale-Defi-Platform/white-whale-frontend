import { TokenInfo } from 'queries/usePoolsListQuery'

import { fetchDollarPriceByTokenIds } from './fetchDollarPriceByTokenIds'
import { pricingServiceIsDownAlert } from './pricingServiceIsDownAlert'

const network = {
  "uni-3": "juno-network",
  "juno-1": "juno-network",
  "phoenix-1": "terra-luna-2",
  "pisco-1": "terra-luna-2"
}

export async function tokenDollarValueQuery(tokenIds: Array<TokenInfo['id']>, chainId) {
  if (!tokenIds?.length) {
    throw new Error('Provide token ids in order to query their price')
  }
  
  try {
    const prices = await fetchDollarPriceByTokenIds(tokenIds, network[chainId])
    
    
    return tokenIds.map((id): number => prices[network[chainId]]?.usd || 0)
  } catch (e) {
    pricingServiceIsDownAlert()

    throw e
  }
}
