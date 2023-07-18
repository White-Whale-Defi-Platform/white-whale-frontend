import { Wallet } from 'util/wallet-adapters/index'
import { useQuery } from 'react-query'

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
  userAddr: string
): AddressInfo => {
  const { data } = useQuery({
    queryKey: ['poolUserShare', contractAddr, userAddr],
    queryFn: async () =>
      await fetchPoolUserShare(client, contractAddr, userAddr),
    enabled: !!client && !!contractAddr && !!userAddr,
    refetchOnMount: 'always',
  })
  return { ...data }
}

export const fetchPoolUserShare = async (
  client: Wallet,
  contractAddr: string,
  userAddr: string
): Promise<AddressInfo> => {
  return await client.queryContractSmart(contractAddr, {
    current_epoch_rewards_share: { address: userAddr },
  })
}
