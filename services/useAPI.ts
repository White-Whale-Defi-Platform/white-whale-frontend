import { GasPrice } from '@cosmjs/launchpad';
import { API_URL, CHAINNAMES } from "../constants";
import { getGasPrices } from '../constants/signerOptions';

export async function getPoolFromAPI(chainnameid: string, address: string) {
    let data: any = null;
    if (API_URL) {
        try {
            const response = await fetch(`${API_URL}/query/${chainnameid}/pool/${address}`);
            data = await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    return data?.data || null;
}

export async function getFlowsFromAPI(chainnameid: string, address: string) {
    let data: any = null;

    if (API_URL) {
        try {
            const response = await fetch(`${API_URL}/query/${chainnameid}/flows/${address}`);
            data = await response.json();
            console.log(data)
        } catch (error) {
            console.error(error);
        }
    }

    return data?.data || null;
}


export async function getHealthyRPCs(chainnameid: string) {
    try {
        const response = await fetch(`${API_URL}/api/rpcs/${chainnameid}`);
        const data = await response.json();
        if (data.data !== 'Chain not found') {
            const out = data.data.map((elem: any) => elem.slice(0, -1))
            return out
        } else {
            return null
        }
    } catch (err) {
        console.log("Unable to fetch -", err);
        return null;
    }
}

export async function getPricesAPI(ids: Array<string>) {
    try {
        const response = await fetch(API_URL + '/api/prices')
        const out = await response.json()
        ids.forEach((chainID: string) => {
            if (!out.includes(chainID)) {
                throw new Error('Price not found on api: ' + chainID)
            }
        })
        return out.data
    } catch (e) {
        return null
    }
}


export async function getHealthyRESTS(chainnameid: string) {
    try {
        const response = await fetch(`${API_URL}/api/rests/${chainnameid}`);
        const data = await response.json();
        if (data.data !== 'Chain not found') {
            const out = data.data.map((elem: any) => elem.slice(0, -1))
            return out
        } else {
            return null
        }
    } catch (err) {
        console.log("Unable to fetch -", err);
        return null;
    }
}


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
    console.log(endpoints)
    return endpoints
}

export async function createwithGas(chains: any) {
    const prices = await getGasPricesAPI()
    const outChains = []
    chains.forEach(element => {
        let tmpChain = element
        if (prices[element.chain_name]) {
            const price = prices[element.chain_name]
            let oldprices = element.fees.fee_tokens.find((elem: any) => price.includes(elem.denom))
            const priceAmount = price.split(oldprices.denom)[0]
            oldprices.average_gas_price = Number(priceAmount)

            tmpChain.fees.fee_tokens = [oldprices]
            outChains.push(tmpChain)
        }
    });
    console.log(outChains)
    return outChains
}

export async function getGasPricesAPI() {
    let data: any = null;

    if (API_URL) {
        try {
            const response = await fetch(`${API_URL}/api/gasprices`);
            data = await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    return data?.data || null;
}

function createGasPricesAPI(chainName: string, chain: any, priceAPI: any) {
    console.log(priceAPI[chainName])
    if (priceAPI[chainName]) {
        return {
            gasPrice: GasPrice.fromString(priceAPI[chainName]),
        }
    } else {
        return getGasPrices(chainName, chain)
    }
}


export async function getAPRData(chain_name:string) {
    let data: any = null;
    if (API_URL) {
        try {
            const response = await fetch(`${API_URL}/api/pools/${chain_name}`);
            data = await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    return data?.data || null;
}