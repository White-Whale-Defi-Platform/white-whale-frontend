import { ACTIVE_NETWORKS, ChainId } from 'constants/index'
import { promises as fs } from 'fs'
import path from 'path'

export async function getServerSideProps(context) {
  const { chainId, poolId } = context.params

  // Construct the file path to the JSON file in the public directory
  const filePath = path.join(
    process.cwd(), 'public', 'mainnet', ACTIVE_NETWORKS.mainnet[chainId], 'pools_list.json',
  )
  try {
    // Read the file from the filesystem
    const jsonData = await fs.readFile(filePath, 'utf8')
    const poolData = JSON.parse(jsonData)
    let pool = poolData.pools.find((pool) => pool.pool_id === poolId)
    if (!pool) {
      // If no pool matches, redirect to a custom 404 page or another page
      const isOsmosisRedirect = chainId == ChainId.osmosis
      pool = isOsmosisRedirect ? poolData.pools.find((pool) => pool.osmo_pool_id === Number(poolId)) : pool
      if (!pool) {
        return {
          redirect: {
            destination: '/404',
            permanent: false,
          },
        }
      } else {
        return {
          redirect: {
            destination: `/${chainId}/pools/manage_liquidity?poolId=${pool.pool_id}`,
            permanent: false,
          },
        }
      }
    } else {
      return {
        redirect: {
          destination: `/${chainId}/pools/manage_liquidity?poolId=${poolId}`,
          permanent: false,
        },
      }
    }
  } catch (error) {
    console.error('Failed to read pool data:', error);
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    }
  }
}

export default function PoolAddressPage() {
  // This component does nothing because we're redirecting server-side
  return null
}
