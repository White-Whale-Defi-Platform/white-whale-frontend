import { endpointOptions } from 'constants/endpointOptions';

import { API_URL, CHAIN_NAMES } from '../constants';

export const getPoolFromAPI = async (chainNameId: string, address: string) => {
  try {
    const response = await fetch(`${API_URL}/query/${chainNameId}/pool/${address}`);
    const json = await response.json()
    return json?.data || null;
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getFlowsFromAPI = async (chainNameId: string, address: string) => {
  try {
    const response = await fetch(`${API_URL}/query/${chainNameId}/flows/${address}`);
    const json = await response.json()
    return json?.data || null
  } catch (error) {
    console.error(error);
  }
  return null
}

export const getHealthyRPCs = async (chainNameId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/rpcs/${chainNameId}`)
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

export const getRandomRPC = async (chainNameId:string) => {
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
    const response = await fetch(`${API_URL}/api/rests/${chainNameId}`);
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

export const getRandomREST = async (chainNameId:string) => {
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
    let response = await fetch(`${API_URL}/api/prices`)
    let res = await response.text()
    while (!res) {
      response = await fetch(`${API_URL}/api/prices`)
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

// Not used yet
export const createEndpointOptions = (chains: any) => {
  const endpoints: Record<string, any> = {}
  CHAIN_NAMES.forEach(async (chain: string) => {
    endpoints[chain] = {}
    endpoints[chain] = {
      rpc: await getHealthyRPCs(chain),
      rest: await getHealthyRestEndpoints(chain),
    }
    if (!endpoints[chain].rpc || !endpoints[chain].rest) {
      const registry = chains.find((chainRes: any) => chainRes.chain_name === chain)
      const rests = registry.apis.rest.map((elem: any) => elem.address)
      const rpcs = registry.apis.rpc.map((elem: any) => elem.address)
      endpoints[chain] = { rpc: rpcs,
        rest: rests }
    }
  })
  return endpoints
}

export const getGasPricesAPI = async () => {
  try {
    const response = await fetch(`${API_URL}/api/gasprices`)
    const json = await response.json()
    return json?.data || null
  } catch (error) {
    console.error(error)
    return null
  }
}

// Not used yet
export const getAprData = async (chain_name: string) => {
  try {
    const response = await fetch(`${API_URL}/api/pools/${chain_name}`)
    const json = await response.json()
    return json?.data || null
  } catch (error) {
    console.error(error)
    return null
  }
}
