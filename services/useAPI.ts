import { API_URLS, CHAIN_NAMES } from 'constants/';
import { endpointOptions } from 'constants/endpointOptions';

export const getFastestAPI = async (recheck = false) => {
  let storageAPI = localStorage.getItem('ww-api')
  if (!storageAPI || recheck) {
    storageAPI = API_URLS[0]
    let duration = 10000
    for (const api of API_URLS) {
      try {
        await fetchWithTimeout(api, 1000)
        const queryPerformance = performance.getEntriesByName(`${api}/`)
        if (duration > queryPerformance[queryPerformance.length - 1]?.duration) {
          duration = queryPerformance[queryPerformance.length - 1]?.duration
          storageAPI = api
        }
      } catch (e) {
        console.error(e)
      }
    }
    localStorage.setItem('ww-api', storageAPI)
  }

  return storageAPI
}

export const getPoolFromAPI = async (chainNameId: string, address: string) => {
  try {
    const response = await fetchWithTimeout(`${await getFastestAPI()}/query/${chainNameId}/pool/${address}`, 1000);
    const json = await response.json()
    return json?.data || null;
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getFlowsFromAPI = async (chainNameId: string, address: string) => {
  try {
    const response = await fetchWithTimeout(`${await getFastestAPI()}/query/${chainNameId}/flows/${address}`, 1000);
    const json = await response.json()
    return json?.data || null
  } catch (error) {
    console.error(error);
  }
  return null
}

export const getHealthyRPCs = async (chainNameId: string) => {
  try {
    const response = await fetchWithTimeout(`${await getFastestAPI()}/api/rpcs/${chainNameId}`, 2000)
    const json = await response.json()
    if (json.data !== 'Chain not found') {
      return json.data
    } else {
      return null
    }
  } catch (err) {
    console.log('Unable to fetch -', err);
    return null;
  }
}

// Not used yet.
export const getRandomRPC = async (chainNameId: string) => {
  let localRpcs = await getHealthyRPCs(chainNameId)
  if (!localRpcs) {
    localRpcs = endpointOptions.endpoints[chainNameId].rpc[0]
  } else {
    localRpcs = localRpcs[Math.floor((Math.random() * localRpcs.length))]
  }
  return localRpcs
}

export const getHealthyRestEndpoints = async (chainNameId: string) => {
  try {
    const response = await fetchWithTimeout(`${await getFastestAPI()}/api/rests/${chainNameId}`);
    const json = await response.json();
    if (json?.data !== 'Chain not found') {
      return json?.data
    } else {
      return null
    }
  } catch (err) {
    console.log('Unable to fetch -', err);
    return null;
  }
}
// Not used yet.
export const getRandomREST = async (chainNameId: string) => {
  let localRestEndpoints = await getHealthyRestEndpoints(chainNameId)
  if (!localRestEndpoints) {
    localRestEndpoints = endpointOptions.endpoints[chainNameId].rest[0]
  } else {
    localRestEndpoints = localRestEndpoints[Math.floor((Math.random() * localRestEndpoints.length))]
  }
  return localRestEndpoints
}

export const getPricesAPI = async (ids: Array<string>) => {
  try {
    let response = await fetchWithTimeout(`${await getFastestAPI()}/api/prices`)
    let res = await response.text()
    while (!response.ok) {
      response = await fetchWithTimeout(`${await getFastestAPI()}/api/prices`)
      res = await response.text()
    }
    const json = JSON.parse(res)
    ids.forEach((geckoID: string) => {
      if (geckoID && !json.data[geckoID]) {
        throw new Error(`Price not found on api: ${geckoID}`)
      }
    })
    return json?.data
  } catch (e) {
    console.log('Unable to fetch -', e)
    return null
  }
}

export const createEndpointOptions = async (chains: any) => {
  const endpoints: Record<string, any> = {}
  CHAIN_NAMES.forEach( async (chain: string) => {
    endpoints[chain] = {}
    endpoints[chain] = {
      rpc: await getHealthyRPCs(chain),
      rest: await getHealthyRestEndpoints(chain),
    }
    if (!endpoints[chain] || !endpoints[chain].rpc || !endpoints[chain].rest) {
      const registry = chains.find((chainRes: any) => chainRes.chain_name === chain)
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

export const getGasPricesAPI = async () => {
  try {
    const response = await fetchWithTimeout(`${await getFastestAPI()}/api/gasprices`)
    const json = await response.json()
    return json?.data || {}
  } catch (error) {
    console.error(error)
    return {}
  }
}

export const getPairAprAndDailyVolumeAPI = async (chain_name: string) => {
  try {
    const response = await fetchWithTimeout(`${await getFastestAPI()}/api/pools/${chain_name}`, 50000)
    const json = await response.json()
    return json?.data || null
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getBondingAPRsAPI = async () => {
    const response = await fetchWithTimeout(`${await getFastestAPI()}/apex/bonding/aprs`, 50000)
    const json = await response.json()
    return json?.data

}

export async function fetchWithTimeout(url: string, timoutMS = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timoutMS);

  const response = await fetch(url, {
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}
