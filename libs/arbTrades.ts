import { num } from "@arthuryeti/terra";
import dayjs from "dayjs";

const ibc = {
    'ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B': {
        denom: "ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B",
        path: "transfer/channel-1",
        base_denom: "uosmo",
        symbol: "OSMO",
        name: "Osmosis",
        icon: "https://assets.terra.money/icon/svg/ibc/OSMO.svg"
    },
    'ibc/EB2CED20AB0466F18BE49285E56B31306D4C60438A022EA995BA65D5E3CF7E09': {
        denom: "ibc/EB2CED20AB0466F18BE49285E56B31306D4C60438A022EA995BA65D5E3CF7E09",
        path: "transfer/channel-16",
        base_denom: "uscrt",
        symbol: "SCRT",
        name: "Secret",
        icon: "https://assets.terra.money/icon/svg/ibc/SCRT.svg"
    },
    'ibc/18ABA66B791918D51D33415DA173632735D830E2E77E63C91C11D3008CFD5262': {
        denom: "ibc/18ABA66B791918D51D33415DA173632735D830E2E77E63C91C11D3008CFD5262",
        path: "transfer/channel-41",
        base_denom: "uatom",
        symbol: "ATOM",
        name: "Cosmos",
        icon: "https://assets.terra.money/icon/svg/ibc/atom.png"
    }
}

export type Token = {
    decimals?: number;
    icon?: string;
    name?: string;
    protocol?: string;
    symbol: string;
    token?: string;
    contract_addr?:string;
}

export type Pair = {
    dex: string;
    from: Token;
    to: Token;
}

export interface ArbTrades {
    timestamp: string;
    txhash: string;
    txHashLink: string;
    arbPairs: Pair[];
    vaultName: string;
    profit: string;
}

const vaults = {
    "terra13fwsh3j8gug52y5x3tmguj3fwhr6c7nxm9kl06": "UST"
}

const nativeTokens = {
    "uusd": {
        symbol: 'UST',
        icon: "https://assets.terra.money/icon/60/UST.png"

    },
    "uluna": {
        symbol: 'LUNA',
        icon: "https://assets.terra.money/icon/60/Luna.png"
    }
}

//get vault transactions from fcd
export const getTxs = async (contract) => {
    const url = `https://fcd.terra.dev/v1/txs?offset=0&limit=100&account=${contract}`
    const res = await fetch(url)
    return await res.json()
}

//get token info from terrafinder
export const getToken = async () => {
    const response = await fetch("https://assets.terra.money/cw20/tokens.json")
    const tokens = await response.json()
    return {...tokens.classic, ...ibc}
}

const tokenOrNative = (assetInfo) => {
    const { native_token, token } = assetInfo
    const { denom } = native_token || {}
    const { contract_addr } = token || {}
    return denom || contract_addr
}


const buildRoutes = (trades, tokens): Pair[] => {

    const routes: Pair[] = []
    const pairs = trades.map(({ asset_info, dex }) => {
        const address = tokenOrNative(asset_info)
        const tokensWithNative = { ...tokens, ...nativeTokens }
        const token = tokensWithNative[address] || asset_info.token
        const [dexName] = Object.keys(dex)
        return ({ token, dex: dexName })
    })
    pairs.forEach(({ dex }, index) => {
        const from = pairs[index].token
        const to = index + 1 === pairs.length
            ? pairs[0]?.token
            : pairs[index + 1]?.token
        routes.push({ dex, from, to })
    })
    return routes
}

export const getTrdes = (txs = [], tokens): ArbTrades[] => {

    const arbTrades: ArbTrades[] = []

    txs.forEach((trade: any) => {
        const { logs } = trade
        const [msg] = trade.tx.value.msg
        const { contract } = msg.value || {}
        const { trades = [] } = msg.value.execute_msg.initiate_arbitrage || {}
        const arbPairs: Pair[] = buildRoutes(trades, tokens)
        if(!trades.length) return

        logs.forEach(({ events }: any) => {
            const wasm = events.filter(({ type }: any) => type === 'wasm')
            wasm.forEach((event: any) => {
                const [isSwap] = event.attributes.filter(({ key }: any) => key === 'action')

                if (!!isSwap) {
                    const txhash = trade.txhash
                    const txHashLink = `https://finder.terra.money/classic/tx/${txhash}`
                    const timestamp = dayjs(trade.timestamp).format('MM/DD/YYYY HH:mm:ss')
                    const [profit] = event.attributes
                        .filter(({ key }) => key === 'profit')
                        .map(({ value }) => num(value).div(1000000).dp(2).toNumber())

                    arbTrades.push({
                        timestamp,
                        txhash,
                        txHashLink,
                        arbPairs,
                        vaultName: vaults[contract],
                        profit,
                    })
                }
            })
        })
    })

    return arbTrades
}