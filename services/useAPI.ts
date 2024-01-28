import { API_URL, CHAINNAMES } from "../constants";
import { endpointOptions } from "../constants/endpointOptions";

let pools: any = {}
let flows: any = {}
let prices: any = {}
let rpcs: any = {}
let gasprices: any = {}
let rests: any = {}
let APRData: any = {}

export async function getPoolFromAPI(chainnameid: string, address: string) {
    let data: any = null;
    let local = pools[address]
    const time = Date.now()
    if (local && local.time > time) {
        return local.data
    }
    if (API_URL) {
        try {
            const response = await fetch(`${API_URL}/query/${chainnameid}/pool/${address}`);
            data = await response.json();
            pools[address] = { data: data.data, time: time + 15000 }
        } catch (error) {
            console.error(error);
        }
    }

    return data?.data || null;
}

export async function getFlowsFromAPI(chainnameid: string, address: string) {
    let data: any = null;

    let local = flows[address]
    const time = Date.now()
    if (local && local.data && local.time > time) {
        return local.data
    }

    if (API_URL) {
        try {
            const response = await fetch(`${API_URL}/query/${chainnameid}/flows/${address}`);
            data = await response.json();
            flows[address] = { data: data.data, time: time + 60000 }
        } catch (error) {
            console.error(error);
        }
    }

    return data?.data || null;
}

export async function getRandomRPC(chainNameid:string) {
    let localrpcs = await getHealthyRPCs(chainNameid)
    if (!localrpcs){
        localrpcs = endpointOptions.endpoints[chainNameid].rpc[0]
    } else {
        localrpcs = localrpcs[Math.floor((Math.random()*localrpcs.length))]
    }
    return localrpcs
}

export async function getRandomREST(chainNameid:string) {
    let localrests = await getHealthyRESTS(chainNameid)
    if (!localrests){
        localrests = endpointOptions.endpoints[chainNameid].rest[0]
    } else {
        localrests = localrests[Math.floor((Math.random()*localrests.length))]
    }
    return localrests
}


export async function getHealthyRPCs(chainnameid: string) {
    let local = rpcs[chainnameid]
    const time = Date.now()
    if (local && local.data && local.time > time) {
        return local.data
    }
    try {
        const response = await fetch(`${API_URL}/api/rpcs/${chainnameid}`);
        const data = await response.json();
        if (data.data !== 'Chain not found') {
            rpcs[chainnameid] = { data: data.data, time: time + 60000 }
            return data.data
        } else {
            return null
        }
    } catch (err) {
        console.log("Unable to fetch -", err);
        return null;
    }
}

export async function getPricesAPI(ids: Array<string>) {
    let local = prices
    const time = Date.now()
    if (local && local?.data && local.time > time) {
        return local.data
    }
    try {
        const response = await fetch(API_URL + '/api/prices')
        const out = await response.json()
        ids.forEach((chainID: string) => {
            if (!out.data[chainID]) {
                throw new Error('Price not found on api: ' + chainID)
            }
        })
        prices = { data: out.data, time: time + 60000 }
        return out.data
    } catch (e) {
        console.log("Unable to fetch -", e)
        return null
    }
}


export async function getHealthyRESTS(chainnameid: string) {
    let local = rests[chainnameid]
    const time = Date.now()
    if (local && local.time > time) {
        return local.data
    }
    try {
        const response = await fetch(`${API_URL}/api/rests/${chainnameid}`);
        const data = await response.json();
        if (data.data !== 'Chain not found') {
            rests[chainnameid] = { data: data.data, time: time + 60000 }
            return data.data
        } else {
            return null
        }
    } catch (err) {
        console.log("Unable to fetch -", err);
        return null;
    }
}

//Not used yet
export async function createEndpointOptions(chains: any) {
    const endpoints: Record<string, any> = {}
    CHAINNAMES.forEach(async (chain: string) => {
        endpoints[chain] = {}
        endpoints[chain] = {
            rpc: await getHealthyRPCs(chain), rest: await getHealthyRESTS(chain)
        }
        if (!endpoints[chain].rpc || !endpoints[chain].rest) {
            let registry = chains.find((chainRes: any) => chainRes.chain_name == chain)
            let rests = registry.apis.rest.map((elem: any) => elem.address)
            let rpcs = registry.apis.rpc.map((elem: any) => elem.address)
            endpoints[chain] = { rpc: rpcs, rest: rests }
        }
    })
    return endpoints
}

export async function getGasPricesAPI() {
    let data: any = null;
    let local = gasprices
    const time = Date.now()
    if (local && local?.data && local.time > time) {
        return local.data
    }
    if (API_URL) {
        try {
            const response = await fetch(`${API_URL}/api/gasprices`);
            data = await response.json();
            gasprices = { data: data.data, time: time + 300000 }
        } catch (error) {
            console.error(error);
        }
    }

    return data?.data || null;
}

// Not used yet
export async function getAPRData(chain_name: string) {
    let data: any = null;
    let local = APRData[chain_name]
    const time = Date.now()
    if (local && local?.data && local?.time > time) {
        return local.data
    }
    if (API_URL) {
        try {
            const response = await fetch(`${API_URL}/api/pools/${chain_name}`);
            data = await response.json();
            APRData[chain_name] = { data: data.data, time: time + 300000 }
        } catch (error) {
            console.error(error);
        }
    }
    return data?.data || null;
}