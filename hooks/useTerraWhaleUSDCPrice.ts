import { useQuery } from 'react-query'
import { num } from 'libs/num'
import terraPools from 'public/mainnet/phoenix-1/pools_list.json'
import chainInfo from 'public/mainnet/chain_info.json'
import { LCDClient } from '@terra-money/terra.js'
import { useMemo } from 'react'

const fetchTerraWhaleUSDCPrice = async (terraClient: LCDClient) => {
  const { assets } = await terraClient.wasm.contractQuery(
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
  const terraClient = useMemo(() => {
    const terra = chainInfo.find((info) => info.chainId === 'phoenix-1')
    const TERRA_CONFIG = {
      chainID: 'phoenix-1',
      lcdURL: terra.rpc,
      URL: terra.rest,
    }
    return new LCDClient(TERRA_CONFIG)
  }, [chainInfo])

  const { data, error, isLoading } = useQuery(
    ['terraWhaleUSDCPrice'],
    () => fetchTerraWhaleUSDCPrice(terraClient),
    { refetchInterval: 30000 }
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
