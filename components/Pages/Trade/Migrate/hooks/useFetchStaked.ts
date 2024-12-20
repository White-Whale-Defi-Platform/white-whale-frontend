import { useQuery } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { WalletChainName } from 'constants/index'
import { useClients } from 'hooks/useClients'

const fetchStaked = async (client: CosmWasmClient,
  address: string) => {
  const lpToken = await client.getBalance(address, 'factory/terra17vas9rhxhc6j6f5wrup9cqapxn74jvpft069py7l7l9kr7wx3tnsxrazux/uLP')
  const ampLpToken = await client.getBalance(address, 'factory/terra1zly98gvcec54m3caxlqexce7rus6rzgplz7eketsdz7nh750h2rqvu8uzx/7/bluechip/amplp')

  /*
   * Const result: JsonObject = await client.queryContractSmart('terra14mmvqn0kthw6sre75vku263lafn5655mkjdejqjedjga4cw0qx2qlf4arv',
   *   {
   *     staked_balance: {
   *       address,
   *       asset: {
   *         native: 'factory/terra17vas9rhxhc6j6f5wrup9cqapxn74jvpft069py7l7l9kr7wx3tnsxrazux/uLP',
   *       },
   *     },
   *   })
   */
  return Number(lpToken.amount) > 0 ? lpToken : ampLpToken
}
export const useFetchStaked = (address: string): {amount: string, denom: string } => {
  const { cosmWasmClient } = useClients(WalletChainName.terra)
  const { data } = useQuery({
    queryKey: ['fetchStaked', address],
    queryFn: () => fetchStaked(cosmWasmClient, address),
    enabled: Boolean(cosmWasmClient) && Boolean(address),
    staleTime: 30_000, // 30 seconds
    cacheTime: 1 * 60 * 1_000, // 5 minutes
  });

  // Ensure the hook always returns an object with defaults
  return data
}
