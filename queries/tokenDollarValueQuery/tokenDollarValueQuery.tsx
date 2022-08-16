import { TokenInfo } from 'queries/usePoolsListQuery'

import { fetchDollarPriceByTokenIds } from './fetchDollarPriceByTokenIds'
import { pricingServiceIsDownAlert } from './pricingServiceIsDownAlert'

export async function tokenDollarValueQuery(tokenIds: Array<TokenInfo['id']>, chainId) {
  if (!tokenIds?.length) {
    throw new Error('Provide token ids in order to query their price')
  }
  
  try {
    const prices = await fetchDollarPriceByTokenIds(tokenIds, chainId)
    
    
    return tokenIds.map((id): number => prices["juno-network"]?.usd || 0)
  } catch (e) {
    pricingServiceIsDownAlert()

    throw e
  }
}
