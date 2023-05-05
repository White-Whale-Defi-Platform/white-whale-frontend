import { useRecoilState } from 'recoil'
import { useQuery } from 'react-query'
import { num } from 'libs/num'
import { walletState } from 'state/atoms/walletAtoms'
import terraPools from 'public/mainnet/phoenix-1/pools_list.json'

const fetchTerraWhaleUSDCPrice = async (state: any) => {
  terraPools.pools.find((pool) => pool.pool_id === 'WHALE-axlUSDC').swap_address
  const { assets } = await {
    ...state,
    chainId: 'phoenix-1',
  }.client.queryContractSmart(
    terraPools.pools.find((pool) => pool.pool_id === 'WHALE-axlUSDC')
      .swap_address,
    {
      pool: {},
    }
  )

  const [asset1, asset2] = assets
  return num(asset2.amount).div(asset1.amount).toNumber()
}

export const useTerraWhaleUSDCPrice = () => {
  const [currentWalletState] = useRecoilState(walletState)

  const { data, error, isLoading } = useQuery(
    ['terraWhaleUSDCPrice'],
    () => fetchTerraWhaleUSDCPrice(currentWalletState),
    { enabled: !!currentWalletState.client, refetchInterval: 30000 }
  )

  if (error) {
    console.error('Error fetching Terra Whale USDC price:', error)
    return null
  }

  if (isLoading) {
    return null
  }

  return data
}
