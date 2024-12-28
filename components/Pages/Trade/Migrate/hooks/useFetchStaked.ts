import { useQuery } from 'react-query'

import { CosmWasmClient, JsonObject } from '@cosmjs/cosmwasm-stargate'
import { WalletChainName } from 'constants/index'
import { useClients } from 'hooks/useClients'

const fetchStaked = async (client: CosmWasmClient,
  address: string) => {
  const oldDenom = 'factory/terra17vas9rhxhc6j6f5wrup9cqapxn74jvpft069py7l7l9kr7wx3tnsxrazux/uLP'
  const wwLpToken = await client.getBalance(address, oldDenom)
  const ampLpToken = await client.getBalance(address, 'factory/terra1zly98gvcec54m3caxlqexce7rus6rzgplz7eketsdz7nh750h2rqvu8uzx/7/bluechip/amplp')
  const erisLpToken = { denom: oldDenom,
    amount: '0' }
  try {
    const stakedLpBalance: JsonObject = await client.queryContractSmart('terra14mmvqn0kthw6sre75vku263lafn5655mkjdejqjedjga4cw0qx2qlf4arv',
      {
        staked_balance: {
          address,
          asset: {
            native: oldDenom,
          },
        },
      })
    erisLpToken.amount = stakedLpBalance.asset.amount
  } catch (e) {
    console.error('Error: ', e)
  }
  return { wwLpToken: { denom: wwLpToken.denom,
    amount: Number(wwLpToken.amount) * (10 ** -6) },
  erisLpToken: { denom: erisLpToken.denom,
    amount: Number(erisLpToken.amount) * (10 ** -6) },
  ampLpToken: { denom: ampLpToken.denom,
    amount: Number(ampLpToken.amount) * (10 ** -6) } }
}
export const useFetchStaked = (address: string): { wwLpToken: {amount: number, denom: string },
  erisLpToken: {amount: number, denom: string },
  ampLpToken: {amount: number, denom: string } } => {
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
