import { useQuery } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

export interface AddressInfo {
  address: string
  global_weight: string
  address_weight: string
  share: string
  epoch_id: number
}
export const fetchPoolUserShare = async (
  client: CosmWasmClient,
  contractAddr: string,
  userAddr: string,
): Promise<AddressInfo> => await client.queryContractSmart(contractAddr, {
  current_epoch_rewards_share: { address: userAddr },
})

export const usePoolUserShare = (
  cosmWasmClient: CosmWasmClient,
  contractAddr: string,
  userAddr: string,
): AddressInfo => {
  const { data } = useQuery({
    queryKey: ['poolUserShare', contractAddr, userAddr],
    queryFn: async () => await fetchPoolUserShare(
      cosmWasmClient, contractAddr, userAddr,
    ),
    enabled:
      Boolean(cosmWasmClient) && Boolean(contractAddr) && Boolean(userAddr),
    refetchOnMount: 'always',
  })
  return { ...data }
}

