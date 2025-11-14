import { API_URLS, CHAIN_NAMES } from 'constants/';
import { endpointOptions } from 'constants/endpointOptions';

// Configuration flag to control external API usage - reads from environment variable
// Must use NEXT_PUBLIC_ prefix for client-side access
export const USE_EXTERNAL_API = process.env.NEXT_PUBLIC_USE_EXTERNAL_API !== 'false';

export const getFastestAPI = async (recheck = false) => {
  if (!USE_EXTERNAL_API || !API_URLS || API_URLS.length === 0) {
    // Clear cached API when disabled
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ww-api')
    }
    console.log('[useAPI] External API disabled, skipping API checks')
    return null
  }

  let storageAPI = typeof window !== 'undefined' ? localStorage.getItem('ww-api') : null
  if (!storageAPI || recheck) {
    storageAPI = API_URLS[0]
    let duration = 10000
    let foundWorkingAPI = false

    for (const api of API_URLS) {
      try {
        await fetchWithTimeout(api, 1000)
        const queryPerformance = performance.getEntriesByName(`${api}/`)
        if (duration > queryPerformance[queryPerformance.length - 1]?.duration) {
          duration = queryPerformance[queryPerformance.length - 1]?.duration
          storageAPI = api
          foundWorkingAPI = true
        }
      } catch (e) {
        console.error('API check failed for', api, e)
      }
    }

    if (!foundWorkingAPI) {
      console.warn('No working external API found, falling back to direct queries')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ww-api')
      }
      return null
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('ww-api', storageAPI)
    }
  }

  return storageAPI
}

// Cache for failed pool requests to avoid repeated calls
const failedPoolsCache = new Map<string, number>()
const POOLS_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const getPoolFromAPI = async (chainNameId: string, address: string) => {
  // DISABLED: New API doesn't support per-contract queries
  // Falls back to direct blockchain query via getPoolInfo()
  console.log('[getPoolFromAPI] Skipping - new API uses bulk /api/pools endpoint')
  return null
}

// Cache for failed flow requests to avoid repeated calls
const failedFlowsCache = new Map<string, number>()
const FLOWS_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const getFlowsFromAPI = async (chainNameId: string, address: string) => {
  // DISABLED: New API doesn't support flows endpoint yet
  // Falls back to direct blockchain query
  console.log('[getFlowsFromAPI] Skipping - new API does not have flows endpoint')
  return null
}

// REMOVED: getHealthyRPCs() and getHealthyRestEndpoints() - these endpoints never existed
// Using chain-registry directly is faster (no API round trip) and more reliable

// Not used yet.
export const getRandomRPC = async (chainNameId: string) => {
  const localRpcs = endpointOptions.endpoints[chainNameId].rpc
  return localRpcs[Math.floor((Math.random() * localRpcs.length))]
}

// Not used yet.
export const getRandomREST = async (chainNameId: string) => {
  const localRestEndpoints = endpointOptions.endpoints[chainNameId].rest
  return localRestEndpoints[Math.floor((Math.random() * localRestEndpoints.length))]
}

// REMOVED: Old price endpoints - replaced with new /api/prices/:chainId endpoint
// - getPricesAPI() - never existed
// - getPricesFromPoolsAPI() - old format
// - getPricesFromPoolsAPIbyDenom() - old format

export const getPricesFromAPI = async (chainName: string) => {
  try {
    const apiUrl = await getFastestAPI()
    if (!apiUrl) return null

    // Convert chain name to chain ID
    const chainId = CHAIN_NAME_TO_ID[chainName] || `${chainName}-1`

    const response = await fetchWithTimeout(`${apiUrl}/api/prices/${chainId}`, 20000)

    if (response.status === 404) {
      console.log('getPricesFromAPI: Endpoint not available (404), calculating prices from pools')
      return null
    }

    const json = await response.json()

    // New API format: { chain_id, prices: [{ pool_id, token_0: { denom, symbol, price_usd }, token_1: {...} }] }
    if (!json?.prices) {
      return null
    }

    // Build lookup map by denom and symbol
    const priceMap: Record<string, number> = {}

    for (const pool of json.prices) {
      // Add token_0 prices
      if (pool.token_0) {
        if (pool.token_0.denom) priceMap[pool.token_0.denom] = pool.token_0.price_usd
        if (pool.token_0.symbol) priceMap[pool.token_0.symbol] = pool.token_0.price_usd
      }
      // Add token_1 prices
      if (pool.token_1) {
        if (pool.token_1.denom) priceMap[pool.token_1.denom] = pool.token_1.price_usd
        if (pool.token_1.symbol) priceMap[pool.token_1.symbol] = pool.token_1.price_usd
      }
    }

    return priceMap
  } catch (e) {
    console.log('getPricesFromAPI failed, calculating prices from pools:', e)
    return null
  }
}

export const createEndpointOptions = async (chains: any) => {
  const endpoints: Record<string, any> = {}
  // Use chain-registry directly - faster and more reliable than API round trip
  CHAIN_NAMES.forEach((chain: string) => {
    const registry = chains.find((chainRes: any) => chainRes.chain_name === chain)
    if (registry) {
      const rests = registry.apis.rest.map((elem: any) => elem.address)
      const rpcs = registry.apis.rpc.map((elem: any) => elem.address)
      endpoints[chain] = {
        rpc: rpcs,
        rest: rests,
      }
    }
  })
  return endpoints
}

// REMOVED: getGasPricesAPI() - endpoint never existed, using chain-registry directly

// Map chain name to chain ID for new API format
const CHAIN_NAME_TO_ID = {
  'chihuahua': 'chihuahua-1',
  'comdex': 'comdex-1',
  'injective': 'injective-1',
  'juno': 'juno-1',
  'migaloo': 'migaloo-1',
  'terra2': 'phoenix-1',
  'terra': 'phoenix-1',
  'sei': 'pacific-1',
  'terrac': 'columbus-5',
  'osmosis': 'osmosis-1',
  'archway': 'archway-1',
  'inj': 'injective-1',
}

export const getPairAprAndDailyVolumeAPI = async (chain_name: string) => {
  try {
    const apiUrl = await getFastestAPI()
    if (!apiUrl) return null

    // Convert chain name to chain ID if needed
    const chainId = CHAIN_NAME_TO_ID[chain_name] || `${chain_name}-1`

    const response = await fetchWithTimeout(`${apiUrl}/api/pools/${chainId}`)
    const json = await response.json()

    // Handle both old and new API formats
    let pools = null
    if (Array.isArray(json?.data)) {
      // Old API format: { data: [...] }
      pools = json.data
    } else if (Array.isArray(json?.pools)) {
      // New API format: { pools: [...] }
      pools = json.pools
    }

    if (!pools) return null

    // Transform new API format to expected format
    return pools.map(pool => ({
      pool_id: pool.pool_id,
      usdVolume24h: pool.usdVolume24h ?? pool.volume_24h_usd,
      usdVolume7d: pool.usdVolume7d ?? pool.volume_7d_usd,
      apr7d: pool.apr7d ?? pool.apr_7d,
      tvl: pool.tvl ?? pool.tvl_usd,
      ratio: pool.ratio ?? pool.price_0_to_1?.toString() ?? '0',
    }))
  } catch (error) {
    console.error('getPairAprAndDailyVolumeAPI failed:', error)
    return null
  }
}

export const getBondingAPRsAPI = async () => {
  try {
    const apiUrl = await getFastestAPI()
    if (!apiUrl) return null

    const response = await fetchWithTimeout(`${apiUrl}/apex/bonding/aprs`, 50000)
    const json = await response.json()
    return json?.data
  } catch (error) {
    console.error('getBondingAPRsAPI failed:', error)
    return null
  }
}

export async function fetchWithTimeout(url: string, timoutMS = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => {
    controller.abort(new Error(`Request timeout after ${timoutMS}ms`))
  }, timoutMS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timoutMS}ms`)
    }
    throw error;
  }
}
