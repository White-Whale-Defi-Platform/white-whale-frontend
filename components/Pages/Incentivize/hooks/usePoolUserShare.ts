import { useQuery } from 'react-query'

import { Wallet } from 'util/wallet-adapters/index'

export interface AddressInfo {
  address: string
  global_weight: string
  address_weight: string
  share: string
  epoch_id: number
}

export const usePoolUserShare = (
  client: Wallet,
  contractAddr: string,
  userAddr: string,
): AddressInfo => {
  const { data } = useQuery({
    queryKey: ['poolUserShare', contractAddr, userAddr],
    queryFn: async () => fetchPoolUserShare(
      client, contractAddr, userAddr,
    ),
    enabled: Boolean(client) && Boolean(contractAddr) && Boolean(userAddr),
    refetchOnMount: 'always',
  })
  return { ...data }
}

export const fetchPoolUserShare = async (
  client: Wallet,
  contractAddr: string,
  userAddr: string,
): Promise<AddressInfo> => client.queryContractSmart(contractAddr, {
  current_epoch_rewards_share: { address: userAddr },
})
