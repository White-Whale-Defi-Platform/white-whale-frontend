import { TokenInfo } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'

import { fetchDollarPriceByTokenIds } from './fetchDollarPriceByTokenIds'
import { pricingServiceIsDownAlert } from './pricingServiceIsDownAlert'

export const tokenDollarValueQuery = async (tokenIds: Array<TokenInfo['id']>) => {
  if (!tokenIds?.length) {
    throw new Error('Provide token ids in order to query their price')
  }

  try {
    const prices = await fetchDollarPriceByTokenIds(tokenIds)

    return tokenIds.map((id): number => prices[id]?.usd || 0)
  } catch (e) {
    pricingServiceIsDownAlert()

    throw e
  }
}
